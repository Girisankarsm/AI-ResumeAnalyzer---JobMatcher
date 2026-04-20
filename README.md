<div align="center">

# 🧠 ResumeMate — AI Resume Analyzer & Job Matcher

### *Know exactly where you stand before you apply.*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Girisankarsm/AI-ResumeAnalyzer---JobMatcher?style=for-the-badge&color=gold)](https://github.com/Girisankarsm/AI-ResumeAnalyzer---JobMatcher/stargazers)

<br/>

> **ResumeMate** is a production-grade AI web application that analyzes your resume against any job description in seconds — giving you a semantic match score, ATS compliance check, skill gap analysis, and personalized interview prep, all in a stunning dark-mode UI.

<br/>

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [🛠 Tech Stack](#-tech-stack) · [📡 API Reference](#-api-reference) · [📁 Project Structure](#-project-structure)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Semantic Match Score** | Uses `sentence-transformers` (all-MiniLM-L6-v2) for deep contextual similarity — not just keyword counting |
| 🤖 **ATS Compliance Report** | Checks your resume for Applicant Tracking System red flags and gives a pass/fail score |
| 🔍 **Skill Gap Analysis** | Maps your skills against 8 categories (Languages, Frontend, Backend, Cloud, ML/AI, etc.) and shows exactly what's missing |
| 💪 **Resume Strength Audit** | Scores your resume on Experience, Education, Projects, Achievements, and Certifications |
| 🧠 **Google Gemini AI Feedback** | Gets an expert AI recruiter opinion — strengths, concerns, rewritten bullet points, and quick tips |
| 🎤 **Interview Prep** | Auto-generates personalized interview topics, STAR story prompts, and questions to ask the interviewer |
| ⚡ **Async Processing** | Parallel execution of embedding + AI feedback for blazing fast results |
| 🔌 **Graceful Fallback** | Full local analysis mode if Gemini API quota is hit — always works offline |

---

## 🛠 Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│   Vanilla HTML · CSS (dark glassmorphism) · Vanilla JS      │
│   Font Awesome · Google Fonts (Poppins, Outfit)             │
├─────────────────────────────────────────────────────────────┤
│                         BACKEND                             │
│   FastAPI (async) · Uvicorn ASGI server                     │
│   sentence-transformers (all-MiniLM-L6-v2) — local embed    │
│   Google Gemini 1.5 Flash — AI recruiter feedback           │
│   PyPDF2 · python-docx — resume file parsing                │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE                           │
│   Python-dotenv · CORS middleware · Static file serving     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
AI-ResumeAnalyzer---JobMatcher/
│
├── 📂 backend/
│   ├── api.py                 # FastAPI application — all routes & logic
│   ├── requirements.txt       # Backend Python dependencies
│   └── utils/                 # Shared utilities (extensible)
│
├── 📂 frontend/
│   ├── index.html             # Single-page app UI
│   ├── style.css              # Premium dark-mode design system
│   └── script.js              # Tab management, API calls, animations
│
├── 📂 tests/
│   ├── test_client.py         # End-to-end API integration test
│   ├── test_embed.py          # Embedding model test
│   ├── test_embed_all.py      # Full embedding pipeline test
│   ├── test_generate.py       # Gemini generation test
│   ├── test_models.py         # Model availability test
│   └── test_resume.txt        # Sample resume for testing
│
├── 📂 docs/
│   ├── IMPROVEMENTS.md        # Planned features & roadmap
│   ├── QUICKSTART.md          # Detailed quickstart guide
│   └── README_ADVANCED.md     # Advanced configuration options
│
├── 📂 legacy/
│   └── app_streamlit.py       # Original Streamlit prototype (reference)
│
├── 📂 .devcontainer/          # GitHub Codespaces / VS Code Dev Container
├── .env                       # 🔒 API keys — NOT committed
├── .gitignore
├── requirements.txt           # Root-level (for easy pip install)
├── run.sh                     # One-command server startup script
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) *(optional — works without it)*

### 1. Clone the repo

```bash
git clone https://github.com/Girisankarsm/AI-ResumeAnalyzer---JobMatcher.git
cd AI-ResumeAnalyzer---JobMatcher
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

> ⚠️ First run will download the `all-MiniLM-L6-v2` embedding model (~90 MB). This is a one-time download.

### 3. Set your API key

Create a `.env` file in the root:

```env
GEMINI_API_KEY=your_api_key_here
```

> 💡 **No API key?** The app still works with a smart local fallback using only the embedding model.

### 4. Launch the app

```bash
bash run.sh
```

Then open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 📡 API Reference

The backend exposes a clean REST API. All endpoints accept `multipart/form-data`.

### `POST /api/analyze`
> Full resume analysis — the primary endpoint

| Field | Type | Description |
|---|---|---|
| `resume` | `file` | Resume file (PDF, DOCX, or TXT) |
| `jd` | `string` | Full job description text |

**Response:**
```json
{
  "score": 78,
  "semantic_similarity": 0.843,
  "ai_analysis": {
    "matching_skills": ["python", "fastapi", "docker"],
    "missing_skills": ["kubernetes", "terraform"],
    "feedback_summary": "Strong backend profile with...",
    "improvement_tips": ["..."],
    "tailored_bullets": ["..."],
    "strengths": ["..."],
    "concerns": ["..."]
  },
  "ats_compliance": { "score": 85, "issues": [] },
  "resume_strength": { "score": 80, "missing_sections": [] },
  "skills": { "found": {}, "required": {} }
}
```

### `POST /api/skill-gap-analysis`
> Detailed skill gap breakdown by category

### `POST /api/resume-audit`
> Resume quality audit — word count, action verbs, quantifiable metrics

### `POST /api/interview-prep`
> Generate interview topics, STAR stories, and questions to ask

### `GET /api/skills`
> List all 80+ tracked skills across 8 categories

---

## 🎯 How It Works

```
┌──────────────┐     ┌───────────────────────────────────────────────┐
│  User Upload │────▶│  1. Extract text (PDF / DOCX / TXT)           │
│  Resume + JD │     │  2. Encode with MiniLM (local, free, fast)    │
└──────────────┘     │  3. Cosine similarity → match score           │
                     │  4. Gemini AI → structured JSON feedback      │
                     │  5. ATS + Strength analysis (rule-based)      │
                     │  6. Interview prep generation                 │
                     └───────────────────────────────────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────────────┐
                     │  Dashboard with 5 tabs:                       │
                     │  Overview · Skills · ATS · Strength · Interview│
                     └───────────────────────────────────────────────┘
```

---

## 🗺 Roadmap

- [x] Semantic embedding match score
- [x] Google Gemini AI feedback
- [x] ATS compliance checker
- [x] 80+ skill gap analysis across 8 categories
- [x] Interview prep generator
- [x] Local fallback (no API key needed)
- [ ] PDF export of full analysis report
- [ ] Resume rewrite suggestions (in-line edits)
- [ ] Multi-JD batch comparison
- [ ] LinkedIn profile import
- [ ] Resume version history

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or pull request.

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

**Built with ❤️ by [Girisankar S M](https://www.linkedin.com/in/girisankar-s-m/)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/girisankar-s-m/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Girisankarsm)

*If this helped you, please ⭐ star the repo!*

</div>
