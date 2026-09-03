const axios = require("axios");

async function getAuthenticProblemDetails(slug, url = "", platform = "") {
  let lcSlug = slug.replace(/^striver-|^lb-/, "");
  if (url.includes("leetcode.com")) {
    const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
    if (match) lcSlug = match[1];
  }

  // 1. Try LeetCode GraphQL API
  if (platform.toLowerCase().includes("leetcode") || url.includes("leetcode.com") || (!url.includes("geeksforgeeks") && !slug.includes("gfg"))) {
    try {
      const res = await axios.post("https://leetcode.com/graphql", {
        query: `
          query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              questionId
              title
              content
              difficulty
              exampleTestcaseList
            }
          }
        `,
        variables: { titleSlug: lcSlug }
      }, {
        headers: { "Content-Type": "application/json" }
      });
      const q = res.data?.data?.question;
      if (q && q.content) {
        return {
          title: q.title,
          difficulty: q.difficulty,
          platform: "LeetCode",
          description: q.content,
          testCases: (q.exampleTestcaseList || []).map((tc, idx) => ({
            testCaseIndex: idx + 1,
            input: tc,
            expectedOutput: "See example in description"
          }))
        };
      }
    } catch (err) {
      console.warn("LeetCode Fetch Warning:", err.message);
    }
  }

  // 2. Try GeeksforGeeks
  if (url.includes("geeksforgeeks.org")) {
    try {
      const res = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      const html = res.data;
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
      if (nextDataMatch) {
        const jsonData = JSON.parse(nextDataMatch[1]);
        const probData = jsonData?.props?.pageProps?.initialState?.problemData?.allData?.probData;
        if (probData && probData.problem_question) {
          return {
            title: probData.problem_name || "GFG Problem",
            difficulty: probData.difficulty || "Medium",
            platform: "GeeksforGeeks",
            description: probData.problem_question,
            constraints: probData.input_format?.constraints || []
          };
        }
      }
    } catch (err) {
      console.warn("GFG Fetch Warning:", err.message);
    }
  }

  return null;
}

async function testAll() {
  console.log("=== Testing LeetCode Two Sum ===");
  const res1 = await getAuthenticProblemDetails("two-sum", "https://leetcode.com/problems/two-sum/", "LeetCode");
  console.log("LeetCode Title:", res1?.title, "Platform:", res1?.platform, "Desc length:", res1?.description?.length);

  console.log("=== Testing GFG Reverse Array ===");
  const res2 = await getAuthenticProblemDetails("reverse-an-array", "https://www.geeksforgeeks.org/problems/reverse-an-array/1", "GeeksforGeeks");
  console.log("GFG Title:", res2?.title, "Platform:", res2?.platform, "Desc length:", res2?.description?.length);
}

testAll();
