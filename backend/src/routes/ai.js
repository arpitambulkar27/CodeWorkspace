const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

router.post("/review", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: "Code snippet cannot be empty." });
  }

  // Ensure API key exists before instantiating SDK to prevent ADC fallback
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Gemini API key is not configured in backend .env file.",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are CodeForge AI, an expert Senior Software Engineer and Code Reviewer. Review the following ${language || "code"} snippet provided by a user in an online IDE.

Provide a clear, structured review broken down into these exact 3 categories:

1. 🐛 Bug Detection & Edge Cases : Point out any runtime errors, logic bugs, syntax issues, or unhandled edge cases.
2. ⏱️ Complexity Analysis : Estimate the Time Complexity (e.g., O(N), O(1)) and Space Complexity with a 1-sentence explanation.
3. 💡 Refactoring & Optimization Tips : Provide concise tips or cleaner code patterns.

Code to review:
\`\`\`${language || ""}
${code}
\`\`\`
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ review: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error:
        "AI service failed to analyze code. Please check your API key configuration or model name.",
    });
  }
});

module.exports = router;
