const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

Router.post("/", async (req, res) => {
  const { resumeText, jobDescription } = req.body;


  if ( resumeText.trim().length < 50) {
    return res.status(400).json({
      error: "Resume text is too short to analyze",
    });
  }

  try{
    const model = genAI.getGenerativeModel({ model: "gemine-1.5-flash" });


    const prompt = `
    You are an expert technical recruiter and resume coach with 10+ years of experience hiring software developers.

    Analyze the following resume against the job description and return a JSON response only. No extra text, no markdown, just raw JSON.

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
    }
`;


const result = await model.generateContent(prompt);
const response = await result.response;
let text = response.text();


// clean up response in case gemini adds markdown

text = text.replace(/```json/g, "").replace(/```/g, "").trim();


const parsed = JSON.parse(text);

res.json(parsed);
  }
  catch (error) {
    console.error("Gemini API error : ", error.message);
    res.status(500).json({
      error:"Failed to analyze resume. Please try again."
    });
  }
}
);


module.exports = router;
