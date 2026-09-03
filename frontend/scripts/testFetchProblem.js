async function inspectContent(slug) {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
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
      variables: { titleSlug: slug }
    })
  });
  const data = await res.json();
  const q = data.data?.question;
  console.log("=== TITLE ===", q?.title);
  console.log("=== CONTENT SAMPLE ===", q?.content?.slice(0, 500));
  console.log("=== EXAMPLE TESTCASES ===", q?.exampleTestcaseList);
}

inspectContent("two-sum");
