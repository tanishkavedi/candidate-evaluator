# ResumeAI — AI-Powered Resume Analyzer

Analyze your resume against any job description using AI. Get a match score, identify skill gaps, and receive improved bullet point suggestions instantly.

## Live Demo
🔗 https://candidate-evaluator-chi.vercel.app

## Features
- 🎯 AI-powered match score between resume and job description
- ✅ Strengths and weaknesses breakdown
- 🔍 Missing keywords detection
- ✍️ Automatic bullet point rewriting
- 📄 PDF upload and text paste support

 ## Tech Stack
*Frontend*
- React 18, Vite, Tailwind CSS

*Backend*
- Node.js, Express.js
- Multer (file upload)
- OpenRouter API (LLM integration)

*Deployment*
- Frontend: Vercel
- Backend: Render


**Clone the repo**
```bash
git clone https://github.com/tanishkavedi/candidate-evaluator.git
cd candidate-evaluator
```

**Setup backend**
```bash
cd server
npm install
```

Create `.env` file in server folder:
```
OPENROUTER_API_KEY=your_key_here
PORT=5000
```

```bash
node index.js
```

**Setup frontend**
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`


*Setup frontend*
bash
cd client
npm install
npm run dev


Open: http://localhost:5173
 
