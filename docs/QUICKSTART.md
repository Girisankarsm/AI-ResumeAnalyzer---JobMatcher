# 🚀 Quick Start Guide - Resume Intelligence Pro

## Installation & Setup (3 minutes)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Set API Key (Optional but Recommended)
```bash
# Create .env file in the project root
echo "GEMINI_API_KEY=your_key_here" > .env
```

Get your free Gemini API key: https://ai.google.dev/

### Step 3: Start the Server
```bash
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### Step 4: Open in Browser
Visit: http://localhost:8000

---

## Usage (2 steps)

### 1️⃣ Upload Resume & Paste Job Description
- Upload your resume (PDF, DOCX, or TXT)
- Paste the full job description
- Click "Run Full Analysis"

### 2️⃣ Review Results Across 5 Tabs
- **Overview** - Quick summary with score and top insights
- **Skills** - See matching/missing skills by category
- **ATS Compliance** - Check formatting for ATS parsers
- **Resume Strength** - Overall quality assessment
- **Interview Prep** - Prepare for the interview

---

## What You'll Learn

### Match Score (0-100)
How well your resume aligns with the job using AI embeddings

### Key Metrics
- **ATS Score** - Will your resume pass automated screening?
- **Strength Score** - Overall quality of your resume
- **Skill Coverage** - What % of required skills you have

### Actionable Insights
- Specific missing skills
- Formatting issues for ATS
- Content recommendations
- Interview talking points

---

## Example

**Resume:** 5 years Python + React experience, AWS cloud

**Job Description:** Wants Python + React + AWS + Docker expert

**Results:**
- ✅ Match: Python, React, AWS
- ❌ Missing: Docker, Kubernetes
- 💡 Tips: Add Docker experience, mention container orchestration
- 📊 Score: 75%

---

## Pro Tips for Better Results

1. **Complete Job Description** - Use the full description, not just the title
2. **Quantify Achievements** - Use numbers: "30% faster", "$50K saved", "led team of 5"
3. **Match Keywords** - Naturally include skills from the job posting
4. **Include All Sections** - Experience, Education, Projects, Skills, Certifications
5. **Use Standard Formatting** - Simple fonts, clear sections help ATS parsing

---

## Troubleshooting

### Server won't start?
```bash
# Check if port 8000 is in use
lsof -i :8000
# Kill the process using it
kill -9 <PID>
```

### Getting API errors?
- Make sure .env file has correct GEMINI_API_KEY
- If quota exceeded, system uses local analysis (still works!)

### Resume file not loading?
- Ensure it's PDF, DOCX, or TXT format
- File shouldn't be corrupted
- Try a different format if it fails

---

## Features at a Glance

| Feature | Benefit |
|---------|---------|
| Semantic Matching | AI-powered relevance scoring |
| ATS Analysis | Ensure parsing compatibility |
| Skill Gap Detection | Know exactly what's missing |
| Resume Audit | Comprehensive quality check |
| Interview Prep | Prepare talking points |
| Local Processing | Works even without API key |

---

## Next Steps

1. ✅ Start the server
2. 🎯 Upload your resume
3. 📋 Paste a job description
4. 📊 Review the analysis
5. ✏️ Make recommended improvements
6. 🔄 Reanalyze to see progress
7. 💪 Get the job!

---

**Happy optimizing! 🎉**
