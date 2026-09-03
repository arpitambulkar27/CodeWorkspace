async function fetchGfgData(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const html = await res.text();
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (nextDataMatch) {
      const jsonData = JSON.parse(nextDataMatch[1]);
      const probData = jsonData?.props?.pageProps?.initialState?.problemData?.allData?.probData;
      console.log("probData Keys:", Object.keys(probData || {}));
      console.log("problem_name:", probData?.problem_name);
      console.log("problem_question:", (probData?.problem_question || "").slice(0, 600));
      console.log("input_format:", probData?.input_format);
      console.log("output_format:", probData?.output_format);
    }
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

fetchGfgData("https://www.geeksforgeeks.org/problems/reverse-an-array/1");
