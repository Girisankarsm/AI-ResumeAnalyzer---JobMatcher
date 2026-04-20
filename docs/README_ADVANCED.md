# 🧠 AI Resume Analyzer Pro - Advanced Resume Intelligence System

An intelligent, AI-powered resume analysis platform that uses semantic matching, ATS optimization, and advanced analytics to help job seekers optimize their resumes for maximum match with job descriptions.

## ✨ Features

### 🎯 Core Analysis
- **Semantic Matching Score** - Uses machine learning embeddings to compare resume vs job description
- **AI-Powered Feedback** - Gemini AI provides personalized insights on resume alignment
- **Skill Extraction** - Automatically detects and categorizes skills from resume and JD
- **Match Gap Analysis** - Identifies missing skills and provides recommendations

### 📊 Advanced Metrics

#### ATS (Applicant Tracking System) Compliance
- Analyzes resume formatting for ATS compatibility
- Identifies potential issues that could cause parsing problems
- Provides optimization tips for better ATS scoring
- Calculates keyword coverage from job description

#### Resume Strength Assessment
- Evaluates overall resume quality and comprehensiveness
- Checks for essential sections (Experience, Education, Projects, etc.)
- Analyzes content metrics (word count, action verbs, quantifiable achievements)
- Suggests improvements to strengthen the resume

#### Skill Gap Analysis
- Detailed breakdown of matching vs missing skills by category
- Visualizes skill coverage across different domains:
  - Programming Languages
  - Frontend/Backend Development
  - Databases
  - ML/AI Technologies
  - DevOps/Cloud
  - Tools & Platforms
  - Soft Skills

### 🎓 Interview Preparation
- **Key Topics** - Identifies important discussion areas based on job description
- **STAR Story Guidance** - Helps prepare achievement-based stories
- **Interview Questions** - Suggests thoughtful questions to ask the interviewer

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip or conda
- Gemini API Key (optional, but recommended for AI feedback)

### Installation

1. **Clone the repository**
```bash
cd AI-ResumeAnalyzer---JobMatcher
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```
GEMINI_API_KEY=your_api_key_here
```

Get your Gemini API key from: https://ai.google.dev/

4. **Run the server**
```bash
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

5. **Open in browser**
Visit: `http://localhost:8000`

## 📋 API Endpoints

### Main Analysis
**POST** `/api/analyze`
- Upload resume (PDF/DOCX/TXT) and job description
- Returns comprehensive analysis with all metrics

**Example:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "resume=@resume.pdf" \
  -F "jd=<job_description.txt"
```

**Response includes:**
```json
{
  "score": 75,
  "semantic_similarity": 0.72,
  "ats_compliance": {
    "score": 85,
    "issues": ["Add more metrics to achievements"],
    "keyword_coverage": 78.5
  },
  "resume_strength": {
    "score": 80,
    "metrics": {...},
    "missing_sections": [...]
  },
  "ai_analysis": {
    "matching_skills": [...],
    "missing_skills": [...],
    "feedback_summary": "...",
    "strengths": [...],
    "concerns": [...]
  }
}
```

### Skill Gap Analysis
**POST** `/api/skill-gap-analysis`
- Detailed skill gap analysis with recommendations
- Returns breakdown by skill category

### Resume Audit
**POST** `/api/resume-audit`
- Comprehensive quality audit of resume
- Analyzes content metrics and quality indicators

### Interview Preparation
**POST** `/api/interview-prep`
- Generates interview preparation tips
- Suggests key topics and questions to ask

### Skills Database
**GET** `/api/skills`
- Returns all available skills in the system
- Organized by category

## 📊 Dashboard Features

### Tab 1: Overview
- Match score with visual indicator
- Key metrics (ATS, Strength, Skill Coverage)
- AI recruiter assessment
- Strengths and concerns
- Improvement tips and suggested bullet points

### Tab 2: Skills Analysis
- Matching vs missing skills visualization
- Skill breakdown by category with progress bars
- Required skills organized by category
- Identifies exact gaps

### Tab 3: ATS Compliance
- ATS score and compatibility analysis
- List of potential parsing issues
- Actionable optimization tips
- Keyword coverage percentage

### Tab 4: Resume Strength
- Overall strength score
- Content quality metrics
- Section completeness analysis
- Recommendations for additions

### Tab 5: Interview Prep
- Key topics to prepare for
- STAR story guidelines
- Thoughtful questions to ask interviewer

## 🛠️ Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **AI Models**:
  - Semantic Search: Sentence Transformers (all-MiniLM-L6-v2)
  - Feedback: Google Gemini 1.5 Flash
- **Document Processing**: PyPDF2, python-docx
- **Styling**: Modern CSS3 with animations

## 📈 How It Works

### 1. Resume Processing
- Extracts text from PDF, DOCX, or TXT files
- Cleans and normalizes content

### 2. Semantic Analysis
- Converts both resume and JD to embedding vectors
- Calculates cosine similarity for matching score
- Provides human-friendly 0-100% score

### 3. Skill Extraction
- Pattern-based skill detection from comprehensive database
- Categorizes skills into 8 different domains
- Identifies both matching and missing skills

### 4. ATS Analysis
- Checks formatting compatibility
- Analyzes keyword coverage
- Identifies actionable issues

### 5. Quality Assessment
- Evaluates resume comprehensiveness
- Counts action verbs and metrics
- Checks for essential sections

### 6. AI Feedback
- Uses Gemini AI for personalized insights
- Falls back to local analysis if API quota exceeded
- Provides tailored improvement suggestions

## 💡 Tips for Best Results

1. **Use complete job description** - Include full job description for better analysis
2. **Well-formatted resume** - Clean formatting helps ATS analysis
3. **Quantifiable achievements** - Add metrics and numbers to improvements
4. **Keyword matching** - Naturally incorporate key skills from JD
5. **Complete sections** - Include experience, education, projects, and skills

## 🔧 Customization

### Add More Skills
Edit the `ADVANCED_SKILLS` dictionary in `api.py` to add custom skills:
```python
"your_category": ["skill1", "skill2", "skill3"]
```

### Adjust Scoring
Modify scoring algorithms in:
- `calculate_ats_compliance_score()` - ATS weights
- `calculate_resume_strength()` - Strength metrics
- `extract_skills_from_text()` - Skill detection logic

## 📝 Example Usage

1. Upload your resume (PDF/DOCX/TXT)
2. Paste the job description
3. Click "Run Full Analysis"
4. Review results across different tabs:
   - Overview: Get quick summary
   - Skills: See what matches and what's missing
   - ATS: Check formatting compliance
   - Strength: Understand resume quality
   - Interview: Prepare for discussion

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port 8000 is in use
lsof -i :8000
# Kill the process
kill -9 <PID>
```

### API Quota Exceeded
- Gemini free tier has daily limits
- System automatically falls back to local analysis
- Subscribe to higher tier or wait for reset (usually 24 hours)

### Resume Not Parsing
- Ensure file is not corrupted
- Try PDF or DOCX format (better support than TXT)
- Ensure file size is reasonable

## 📄 License
MIT License

## 👨‍💻 Author
GitHub: Girisankarsm

## 🤝 Contributing
Contributions welcome! Feel free to open issues and pull requests.

---

**Made with ❤️ for job seekers and career growth**
