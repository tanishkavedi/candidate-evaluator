const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    return res.status(400).json({
      error: "Both resume and job description are required",
    });
  }

  if (resumeText.trim().length < 50) {
    return res.status(400).json({
      error: "Resume text is too short to analyze",
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: "You are an expert technical recruiter and resume coach. Always respond with valid JSON only. No markdown, no extra text, just raw JSON.",
          },
          {
            role: "user",
            content: `Analyze the following resume against the job description and return JSON only.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return this exact JSON structure:
{
  "matchScore": <number from 0 to 100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "improvedBullets": [
    {
      "original": "<original bullet point from resume>",
      "improved": "<rewritten stronger version>"
    }
  ],
  "overallAdvice": "<specific actionable advice in 2-3 sentences>"
}`,
          },
        ],
      }),
    });



    const data = await response.json();
   

if (!data.choices || !data.choices[0]) {
  console.error("Unexpected response:", data);
  return res.status(500).json({ error: "AI service returned unexpected response" });
}

let text = data.choices[0].message.content;

    const parsed = JSON.parse(text);
    res.json(parsed);
 } catch (error) {
  console.error("Error name:", error.name);
  console.error("Error message:", error.message);
  console.error("Error cause:", error.cause);
  res.status(500).json({
    error: "Failed to analyze resume. Please try again.",
  });
}
});

module.exports = router;