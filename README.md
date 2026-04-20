# 🧠 ResumeMate — AI Resume Analyzer & Job Matcher

An AI-powered resume analysis tool that gives you a **semantic match score**, **ATS compliance report**, **skill gap analysis**, and **interview prep tips** — all in a sleek, dark-mode web UI.

---

## 📁 Project Structure

```
AI-ResumeAnalyzer---JobMatcher/
├── backend/
│   ├── api.py              # FastAPI application (main entry point)
│   ├── requirements.txt    # Backend dependencies
│   └── utils/              # Shared utilities (extensible)
├── frontend/
│   ├── index.html          # Main UI (served at /)
│   ├── style.css           # Premium dark-mode styles
│   └── script.js           # UI logic & API calls
├── tests/
│   ├── test_client.py      # End-to-end API test
│   ├── test_embed.py       # Embedding model test
│   ├── test_embed_all.py   # Full embedding pipeline test
│   ├── test_generate.py    # Gemini generation test
│   ├── test_models.py      # Model availability test
│   └── test_resume.txt     # Sample resume for testing
├── docs/
│   ├── IMPROVEMENTS.md     # Planned improvements
│   ├── QUICKSTART.md       # Quick-start guide
│   └── README_ADVANCED.md  # Advanced configuration
├── legacy/
│   └── app_streamlit.py    # Original Streamlit app (reference only)
├── .devcontainer/          # GitHub Codespaces / VS Code Dev Container config
├── .env                    # API keys (DO NOT commit)
├── requirements.txt        # Root-level requirements (for easy install)
├── run.sh                  # One-command server startup
└── README.md
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure your API key
Edit `.env`:
```
GEMINI_API_KEY=your_key_here
```

### 3. Run the server
```bash
bash run.sh
```
Then open **http://localhost:8000** in your browser.

---

## 🛠 Tech Stack

| Layer     | Technology                                 |
|-----------|--------------------------------------------|
| Backend   | FastAPI + Uvicorn                          |
| AI Match  | `sentence-transformers` (all-MiniLM-L6-v2) |
| AI Feedback | Google Gemini 1.5 Flash                  |
| Frontend  | Vanilla HTML / CSS / JS (dark-mode UI)     |
| File Parse | PyPDF2, python-docx                       |

---

## 🔑 API Endpoints

| Method | Endpoint              | Description                      |
|--------|-----------------------|----------------------------------|
| POST   | `/api/analyze`        | Full resume analysis             |
| POST   | `/api/skill-gap-analysis` | Detailed skill gap report    |
| POST   | `/api/resume-audit`   | Resume quality audit             |
| POST   | `/api/interview-prep` | Generate interview prep content  |
| GET    | `/api/skills`         | List all tracked skills          |

---

## 👤 Author

Built by [Girisankar S M](https://www.linkedin.com/in/girisankar-s-m/) · [GitHub](https://github.com/Girisankarsm)
