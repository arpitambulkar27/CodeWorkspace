const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const { aiRateLimiter } = require("../middleware/rateLimiter");
const { protect } = require("../middleware/authMiddleware");

// Apply Auth Protection & Redis Sliding-Window Rate Limiter
router.post("/review", protect, aiRateLimiter, async (req, res) => {
  const {
    code,
    language,
    type = "hints",
    problemTitle,
    problemDescription,
  } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: "Code snippet cannot be empty." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      review: "⚠️ **AI API Key Missing**: `GEMINI_API_KEY` is not set in `backend/.env`.\n\n**Quick Fix:**\n- Get a free API key from [Google AI Studio](https://aistudio.google.com/).\n- Add `GEMINI_API_KEY=your_key_here` to `backend/.env` and restart the backend server.",
      analysis: "⚠️ **AI API Key Missing**: `GEMINI_API_KEY` is not set in `backend/.env`.\n\n**Quick Fix:**\n- Get a free API key from [Google AI Studio](https://aistudio.google.com/).\n- Add `GEMINI_API_KEY=your_key_here` to `backend/.env` and restart the backend server."
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    let prompt = "";

    if (type === "hints") {
      // GFG AI Style Hint: Short 2-3 sentence nudge, no pointwise template, no solution code!
      prompt = `
You are GFG AI, the official intelligent problem-solving assistant on GeeksforGeeks.

PROBLEM: ${problemTitle ? problemTitle : "DSA Problem"}
${problemDescription ? `DESCRIPTION: ${problemDescription.slice(0, 400)}` : ""}

USER'S WRITTEN CODE (${language || "code"}):
\`\`\`
${code}
\`\`\`

TASK:
Provide a short, direct 2-3 sentence GFG-style hint to help the user move forward.

RULES:
1. Do NOT use multi-step pointwise structures, headers, or long templates.
2. Do NOT provide solution source code or code snippets.
3. Keep it brief (2-3 sentences max) like GeeksforGeeks AI Hint: give a subtle nudge on the key intuition, data structure choice, or loop logic they should think about.
4. Do NOT use dollar signs ($) or LaTeX math syntax.
`;
    } else {
      // Mode: "analysis" - Complexity & Code Evaluation ONLY on written code (NO solution code!)
      prompt = `
You are AI Code Complexity Analyzer.

PROBLEM: ${problemTitle ? problemTitle : "DSA Problem"}
USER'S WRITTEN CODE (${language || "code"}):
\`\`\`
${code}
\`\`\`

CRITICAL RULES:
- DO NOT provide any rewritten code, alternative code, or solution snippets!
- ONLY evaluate the user's existing written code snippet above.
- DO NOT use LaTeX dollar signs ($ or $$) or \\mathcal math formatting. Write Big-O notation strictly as plain text like O(N), O(1), O(N log N).

Format your analysis clearly in Markdown using these 3 exact sections:

⏱️ **Time Complexity**: State the plain text Big-O bound (e.g. O(N)) with a 1-sentence justification of the user's loops/operations.
💾 **Space Complexity**: State the plain text Big-O auxiliary space (e.g. O(1)) with a 1-sentence explanation of allocated memory.
⚠️ **Edge Cases & Code Notes**: Point out 1-2 potential bugs, unhandled input edge cases, or logic flaws in their written code.
`;
    }

    const candidateModels = [
      "gemini-3.6-flash",
      "gemini-2.5-flash-lite",
      "gemini-flash-latest",
      "gemini-1.5-flash"
    ];

    let response = null;
    let lastError = null;

    for (const model of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response && response.text) break;
      } catch (err) {
        lastError = err;
        console.warn(`[AI Route] Model ${model} failed, trying next:`, err.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("All AI model fallbacks failed to respond.");
    }

    let cleanText = response.text || "";
    // Clean any LaTeX $ math formatting
    cleanText = cleanText.replace(/\$|\\text|\\mathcal|\{|\}/g, "");

    res.json({ review: cleanText, analysis: cleanText });
  } catch (error) {
    const errStr = JSON.stringify(error) || error.message || "";
    console.error("AI Service Error:", error.message || error);

    if (error.status === 429 || errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("Quota exceeded")) {
      return res.status(200).json({
        review: "⚠️ **AI Free Tier Quota Reached**: You have hit the daily free limit for this API key.\n\n**Solutions:**\n- Wait 1-2 minutes for the rate limit window to reset.\n- Or generate a new free API key from [Google AI Studio](https://aistudio.google.com/) and update `GEMINI_API_KEY` in `backend/.env`.",
        analysis: "⚠️ **AI Free Tier Quota Reached**: You have hit the daily free limit for this API key.\n\n**Solutions:**\n- Wait 1-2 minutes for the rate limit window to reset.\n- Or generate a new free API key from [Google AI Studio](https://aistudio.google.com/) and update `GEMINI_API_KEY` in `backend/.env`."
      });
    }

    const errorMessage = error.message || "Failed to generate AI response";
    return res.status(200).json({
      review: "⚠️ **AI Service Error**: " + errorMessage + ".\n\n**Quick Fix:**\n- Verify your `GEMINI_API_KEY` in `backend/.env`.\n- Get a fresh free API key from [Google AI Studio](https://aistudio.google.com/).",
      analysis: "⚠️ **AI Service Error**: " + errorMessage + ".\n\n**Quick Fix:**\n- Verify your `GEMINI_API_KEY` in `backend/.env`.\n- Get a fresh free API key from [Google AI Studio](https://aistudio.google.com/)."
    });
  }
});

module.exports = router;
