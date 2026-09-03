const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const { runCode } = require("../services/dockerService");

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
router.post("/:slug/submit", async (req, res) => {
  try {
    const { language, code } = req.body;
    if (!language || !code) {
      return res.status(400).json({ error: "Language and code are required." });
    }

    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    const results = [];
    let passedCount = 0;

    for (let i = 0; i < problem.testCases.length; i++) {
      const tc = problem.testCases[i];
      const runResult = await runCode({
        language,
        code,
        stdin: tc.input,
      });

      const actualOutput = (runResult.stdout || "").trim();
      const expected = (tc.expectedOutput || "").trim();
      const passed = actualOutput === expected;

      if (passed) passedCount++;

      results.push({
        testCaseIndex: i + 1,
        input: tc.isHidden ? "[Hidden Test Case]" : tc.input,
        expectedOutput: tc.isHidden ? "[Hidden Test Case]" : tc.expectedOutput,
        actualOutput: tc.isHidden && !passed ? "[Hidden Test Case Failed]" : actualOutput,
        passed,
        error: runResult.stderr || runResult.error || null,
        isHidden: tc.isHidden,
      });
    }

    const allPassed = passedCount === problem.testCases.length;

    res.json({
      passed: allPassed,
      totalTestCases: problem.testCases.length,
      passedCount,
      scoreCard: results,
    });
  } catch (error) {
    console.error("Submit Solution Error:", error.message);
    res.status(500).json({ error: "Failed to execute solution test cases." });
  }
});

module.exports = router;
