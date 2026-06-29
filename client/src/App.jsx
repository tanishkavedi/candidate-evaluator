import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const API_URL = "https://resume-analyzer-api-mgan.onrender.com";

function App() {
  const [resumeText, setResumeText] = useState(() => {
    return sessionStorage.getItem("resumeText") || "";
  });
  const [jobDescription, setJobDescription] = useState(() => {
    return sessionStorage.getItem("jobDescription") || "";
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
  const savedText = sessionStorage.getItem("resumeText");
  return savedText ? "paste" : "paste";
});
  const [fileName, setFileName] = useState(() => {
  return sessionStorage.getItem("fileName") || "";
});

  // Save to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem("resumeText", resumeText);
  }, [resumeText]);

  useEffect(() => {
    sessionStorage.setItem("jobDescription", jobDescription);
  }, [jobDescription]);

  useEffect(() => {
  sessionStorage.setItem("fileName", fileName);
}, [fileName]);

  const handleClear = () => {
    setResumeText("");
    setFileName("");
    setResult(null);
    setError("");
    sessionStorage.removeItem("resumeText");
    sessionStorage.removeItem("fileName");
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFileName(file.name);
    const formData = new FormData();
    formData.append("resume", file);

    axios
      .post(`${API_URL}/api/upload`, formData)
      .then((res) => {
        if (res.data.text) {
          setResumeText(res.data.text);
          setError("");
        } else {
          setError("Could not extract text from PDF.");
        }
      })
      .catch((err) => {
        setError("Failed to upload PDF: " + (err.response?.data?.error || err.message));
      });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

 const handleAnalyze = async () => {
  console.log("resumeText length:", resumeText.length);
  console.log("sessionStorage text:", sessionStorage.getItem("resumeText")?.length);
  if (!resumeText.trim()) {
    setError("Please add your resume first.");
    return;
  }
    if (!jobDescription.trim()) {
      setError("Please add a job description.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${API_URL}/api/analyze`, {
        resumeText,
        jobDescription,
      });
      setResult(res.data);
    } catch (err) {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 75) return "bg-green-400";
    if (score >= 50) return "bg-yellow-400";
    return "bg-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">ResumeAI</h1>
            <p className="text-xs text-gray-500">AI-powered resume analyzer</p>
          </div>
          <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full">
            Free
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Resume Input */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-300">Your Resume</h2>
                {resumeText && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-2 py-1 rounded-lg transition-colors"
                  >
                    ✕ Clear Resume
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("paste")}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === "paste"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Paste Text
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    activeTab === "upload"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  Upload PDF
                </button>
              </div>

              {activeTab === "paste" ? (
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="w-full h-48 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500 transition-colors"
                />
              ) : (

                 <>
    {resumeText && !fileName && (
      <p className="text-xs text-yellow-400 mb-2">
        ⚠ Resume loaded from previous session — switch to Paste Text to view it
      </p>
    )}

    
                <div
                  {...getRootProps()}
                  className={`h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-blue-500 bg-blue-500/5"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                >


                  <input {...getInputProps()} />
                  <div className="text-4xl mb-2">📄</div>
                  {fileName ? (
                    <p className="text-sm text-green-400">{fileName}</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-400">Drop your PDF here</p>
                      <p className="text-xs text-gray-600 mt-1">or click to browse</p>
                    </>
                  )}
                </div>
                </>
              )}

              {resumeText && activeTab === "upload" && (
                <p className="text-xs text-green-400 mt-2">
                  ✓ Resume text extracted successfully
                </p>
              )}
            </div>

            {/* Job Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">
                Job Description
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description you're applying for..."
                className="w-full h-36 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {!result && !loading && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center h-full min-h-64 text-center">
                <div className="text-5xl mb-3">🎯</div>
                <p className="text-gray-400 text-sm">Your analysis will appear here</p>
                <p className="text-gray-600 text-xs mt-1">
                  Add your resume and job description to get started
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center h-full min-h-64">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-gray-400 text-sm">Analyzing your resume...</p>
              </div>
            )}

            {result && (
              <>
                {/* Score Card */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-300">Match Score</h3>
                    <span className={`text-2xl font-bold ${getScoreColor(result.matchScore)}`}>
                      {result.matchScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${getScoreBg(result.matchScore)}`}
                      style={{ width: `${result.matchScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{result.summary}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-green-400 mb-2">✓ Strengths</h3>
                    <ul className="space-y-1">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-gray-400">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-red-400 mb-2">✗ Weaknesses</h3>
                    <ul className="space-y-1">
                      {result.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-gray-400">• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-yellow-400 mb-2">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((k, i) => (
                      <span key={i} className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-1 rounded-md">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Improved Bullets */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-blue-400 mb-3">Improved Bullet Points</h3>
                  <div className="space-y-3">
                    {result.improvedBullets.map((b, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs text-gray-600 line-through">{b.original}</p>
                        <p className="text-xs text-gray-300">{b.improved}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Advice */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-blue-400 mb-1">Overall Advice</h3>
                  <p className="text-xs text-gray-400">{result.overallAdvice}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;