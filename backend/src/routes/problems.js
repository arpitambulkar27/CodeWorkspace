const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const Problem = require("../models/Problem");
const { runCode } = require("../services/codeExecution");
const { protect } = require("../middleware/authMiddleware");

// Helper to strip trailing numeric IDs from GFG slugs (e.g., maximum-product-subarray3604 -> maximum-product-subarray)
const cleanGfgSlug = (slugStr) => {
  if (!slugStr) return "";
  let cleaned = slugStr.trim().toLowerCase();
  cleaned = cleaned.replace(/\d+$/, "").replace(/-+$/, "");
  return cleaned;
};

// @route   GET /api/problems
// @desc    Get all DSA problems
router.get("/", async (req, res) => {
  try {
    const problems = await Problem.find({})
      .select("title slug difficulty category step sheets externalUrl description")
      .sort({ createdAt: 1 });
    res.json(problems);
  } catch (error) {
    console.error("Fetch Problems Error:", error.message);
    res.status(500).json({ error: "Failed to fetch problems." });
  }
});

// @route   GET /api/problems/details
// @desc    Unified problem details proxy for LeetCode and GeeksforGeeks (using Cheerio scraper & GraphQL)
router.get("/details", async (req, res) => {
  const { platform, slug, url, title } = req.query;

  if (!slug && !url && !title) {
    return res.status(400).json({ error: "Missing problem slug, url, or title" });
  }

  const isGfg = platform?.toLowerCase() === "gfg" || url?.includes("geeksforgeeks.org");

  // ----------------------------------------------------
  // 1. LEETCODE RESOLUTION (Official GraphQL)
  // ----------------------------------------------------
  if (!isGfg) {
    let cleanLcSlug = slug || "";
    if (cleanLcSlug.includes("leetcode.com/problems/")) {
      const match = cleanLcSlug.match(/leetcode\.com\/problems\/([^/#?]+)/);
      if (match && match[1]) cleanLcSlug = match[1];
    }
    cleanLcSlug = cleanLcSlug.split("#")[0].split("?")[0].replace(/\/$/, "").split("/").pop().trim().toLowerCase();

    const query = `
      query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          difficulty
          content
          exampleTestcases
          codeSnippets {
            lang
            langSlug
            code
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        "https://leetcode.com/graphql",
        { query, variables: { titleSlug: cleanLcSlug } },
        {
          headers: {
            "Content-Type": "application/json",
            "Referer": "https://leetcode.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
        }
      );

      let q = response.data?.data?.question;

      if (!q && title) {
        const titleSlug = String(title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        if (titleSlug && titleSlug !== cleanLcSlug) {
          const fallbackRes = await axios.post(
            "https://leetcode.com/graphql",
            { query, variables: { titleSlug } },
            {
              headers: {
                "Content-Type": "application/json",
                "Referer": "https://leetcode.com",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
              },
            }
          );
          q = fallbackRes.data?.data?.question;
        }
      }

      if (!q) {
        return res.status(404).json({ error: "Problem not found on LeetCode" });
      }

      return res.json({
        platform: "LeetCode",
        title: q.title,
        difficulty: q.difficulty,
        content: q.content,
        codeSnippets: q.codeSnippets || [],
        exampleTestcases: q.exampleTestcases || "",
      });
    } catch (err) {
      console.error("LeetCode fetch error:", err.message || err);
      return res.status(500).json({ error: "Failed to fetch from LeetCode" });
    }
  }

  // ----------------------------------------------------
  // 2. GEEKSFORGEEKS RESOLUTION (Backend Cheerio Scraper)
  // ----------------------------------------------------
  try {
    let rawSlug = slug || "";
    if (url && url.includes("geeksforgeeks.org/problems/")) {
      const match = url.match(/geeksforgeeks\.org\/problems\/([^/#?]+)/);
      if (match && match[1] && match[1] !== "0" && match[1] !== "1") rawSlug = match[1];
    } else if (url && url.includes("geeksforgeeks.org/")) {
      const match = url.match(/geeksforgeeks\.org\/([^/#?]+)/);
      if (match && match[1]) rawSlug = match[1];
    }

    rawSlug = rawSlug.split("#")[0].split("?")[0].replace(/\/0$/, "").replace(/\/1$/, "").replace(/\/$/, "");
    const parts = rawSlug.split("/").filter((p) => p !== "0" && p !== "1" && p !== "");
    const cleanSlugStr = (parts.pop() || rawSlug).trim().toLowerCase();

    const targetUrl = url || `https://www.geeksforgeeks.org/problems/${cleanSlugStr}/1`;

    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
      },
      timeout: 8000,
    });

    if (response.status === 200 && response.data) {
      const html = response.data;
      const $ = cheerio.load(html);

      let statementHtml =
        $(".problem-statement").html() ||
        $("[class*='problem-statement']").html() ||
        $("[class*='problems_problem_content']").html() ||
        $(".entry-content").html();

      if (statementHtml) {
        const $cleaned = cheerio.load(statementHtml);
        $cleaned("script, style, button, iframe, input").remove();
        statementHtml = $cleaned.html();
      }

      const parsedTitle =
        $("h1").first().text().trim() ||
        title ||
        cleanSlugStr.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      if (statementHtml) {
        return res.json({
          platform: "GFG",
          title: parsedTitle,
          difficulty: "Medium",
          content: statementHtml,
          codeSnippets: [],
        });
      }
    }
  } catch (err) {
    console.error("GFG parsing error:", err.message || err);
  }

  // Fallback: GFG Practice API v1 candidate loop
  try {
    let cleanGfg = slug || "";
    cleanGfg = cleanGfgSlug(cleanGfg);
    if (cleanGfg) {
      const gfgApiUrl = `https://practiceapi.geeksforgeeks.org/api/v1/problems/problem/${cleanGfg}/`;
      const apiRes = await axios.get(gfgApiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        timeout: 6000,
      });

      if (apiRes.data && apiRes.data.results) {
        const pData = apiRes.data.results;
        return res.json({
          platform: "GFG",
          title: pData.problem_name || title || cleanGfg,
          difficulty: pData.difficulty || "Medium",
          content: pData.problem_question || pData.description || "",
          codeSnippets: [],
        });
      }
    }
  } catch (e) {
    // silent
  }

  return res.status(500).json({ error: "Failed to parse GeeksforGeeks statement" });
});

// @route   GET /api/problems/leetcode/:slug
// @desc    Fetch official LeetCode question details via GraphQL
router.get("/leetcode/:slug", async (req, res) => {
  req.query.platform = "LeetCode";
  req.query.slug = req.params.slug;
  return router.handle(req, res);
});

// @route   GET /api/problems/gfg/:slug
// @desc    Fetch official GeeksforGeeks question details via Cheerio/API
router.get("/gfg/:slug", async (req, res) => {
  req.query.platform = "GFG";
  req.query.slug = req.params.slug;
  return router.handle(req, res);
});

// @route   GET /api/problems/:slug
// @desc    Get single problem by slug
router.get("/:slug", async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    const publicProblem = {
      _id: problem._id,
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      category: problem.category,
      sheets: problem.sheets,
      externalUrl: problem.externalUrl,
      description: problem.description,
      starterCode: problem.starterCode,
      testCases: problem.testCases
        .filter((tc) => !tc.isHidden)
        .map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        })),
    };

    res.json(publicProblem);
  } catch (error) {
    console.error("Get Problem Error:", error.message);
    res.status(500).json({ error: "Failed to load problem details." });
  }
});

// @route   POST /api/problems/:slug/submit
// @desc    Submit code solution for a problem and evaluate against test cases
router.post("/:slug/submit", protect, async (req, res) => {
  try {
    const { language, code } = req.body;
    if (!language || !code) {
      return res.status(400).json({ error: "Language and code are required." });
    }

    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    // Limit execution to first 10 test cases max to prevent Gateway Timeouts
    const testCasesToRun = (problem.testCases || []).slice(0, 10);

    const testPromises = testCasesToRun.map(async (tc, index) => {
      const runResult = await runCode({
        language,
        code,
        stdin: tc.input,
      });

      const actualOutput = (runResult.stdout || "").trim();
      const expected = (tc.expectedOutput || "").trim();
      const passed = actualOutput === expected;

      return {
        testCaseIndex: index + 1,
        input: tc.isHidden ? "[Hidden Test Case]" : tc.input,
        expectedOutput: tc.isHidden ? "[Hidden Test Case]" : tc.expectedOutput,
        actualOutput: tc.isHidden && !passed ? "[Hidden Test Case Failed]" : actualOutput,
        passed,
        error: runResult.stderr || runResult.error || null,
        isHidden: tc.isHidden,
      };
    });

    const results = await Promise.all(testPromises);
    const passedCount = results.filter((r) => r.passed).length;
    const allPassed = passedCount === testCasesToRun.length;

    res.json({
      passed: allPassed,
      totalTestCases: testCasesToRun.length,
      passedCount,
      scoreCard: results,
    });
  } catch (error) {
    console.error("Submit Solution Error:", error.message);
    res.status(500).json({ error: "Failed to execute solution test cases." });
  }
});

module.exports = router;
