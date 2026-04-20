import os
import io
import json
import asyncio
import numpy as np
import re
from collections import Counter
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from google import genai
from google.genai import types
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Tuple

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Initialize Local Semantic Search (100% Free, Unlimited, No API key needed)
print("Loading local embedding model (all-MiniLM-L6-v2)...")
embed_model = SentenceTransformer('all-MiniLM-L6-v2') 
print("Local model loaded.")

# Comprehensive Skills Database
ADVANCED_SKILLS = {
    "programming_languages": [
        "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", 
        "scala", "kotlin", "swift", "ruby", "php", "r", "matlab", "perl", "dart"
    ],
    "frontend": [
        "react", "vue.js", "angular", "svelte", "next.js", "nuxt", "webpack", 
        "sass", "tailwind", "bootstrap", "material ui", "figma", "adobe xd", "html", "css"
    ],
    "backend": [
        "fastapi", "django", "flask", "express.js", "spring boot", "asp.net", 
        "gin", "fiber", "actix", "laravel", "hibernate", "sqlalchemy"
    ],
    "databases": [
        "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", 
        "dynamodb", "cassandra", "neo4j", "firebase", "firestore", "datastore"
    ],
    "ml_ai": [
        "tensorflow", "pytorch", "scikit-learn", "keras", "nlp", "opencv", 
        "pandas", "numpy", "hugging face", "xgboost", "lightgbm", "langchain"
    ],
    "devops_cloud": [
        "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "jenkins", 
        "gitlab ci", "github actions", "prometheus", "grafana", "ansible", "helm"
    ],
    "tools_platforms": [
        "git", "linux", "jira", "confluence", "slack", "notion", "datadog",
        "splunk", "git", "bitbucket", "heroku", "netlify", "vercel", "render"
    ],
    "soft_skills": [
        "leadership", "communication", "problem solving", "teamwork", "agile", 
        "scrum", "kanban", "mentoring", "analytical", "critical thinking"
    ]
}

# 2. Configure Gemini for Feedback
API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=API_KEY)

# Serve frontend static files
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
FRONTEND_DIR = os.path.normpath(FRONTEND_DIR)
os.makedirs(FRONTEND_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

def extract_skills_from_text(text: str) -> Dict[str, List[str]]:
    """Extract skills from text using pattern matching."""
    text_lower = text.lower()
    found_skills = {}
    
    for category, skills in ADVANCED_SKILLS.items():
        found = []
        for skill in skills:
            # Case-insensitive, word-boundary matching
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                found.append(skill)
        if found:
            found_skills[category] = found
    
    return found_skills

def calculate_ats_compliance_score(resume_text: str, jd_text: str) -> Dict:
    """Calculate ATS compliance score."""
    score = 100
    issues = []
    
    # Check for basic formatting issues
    if len(resume_text) < 200:
        score -= 20
        issues.append("Resume is too short - add more details")
    
    # Check for keywords from JD
    jd_words = set(jd_text.lower().split())
    resume_words = set(resume_text.lower().split())
    jd_keyword_coverage = len(jd_words & resume_words) / max(len(jd_words), 1)
    
    if jd_keyword_coverage < 0.3:
        score -= 15
        issues.append("Low keyword match with job description")
    
    # Check for numbers/metrics
    if not re.search(r'\d+%|$\d+|#\d+|improved by \d+', resume_text.lower()):
        score -= 10
        issues.append("Add quantifiable achievements (numbers, percentages)")
    
    # Check for action verbs
    action_verbs = ["developed", "designed", "implemented", "led", "managed", "improved", 
                    "created", "built", "launched", "optimized", "delivered"]
    has_action_verbs = any(verb in resume_text.lower() for verb in action_verbs)
    if not has_action_verbs:
        score -= 10
        issues.append("Use strong action verbs to describe accomplishments")
    
    # Check for contact info
    if not re.search(r'\S+@\S+\.\S+', resume_text):  # email check
        score -= 5
        issues.append("Ensure contact information is clearly visible")
    
    return {
        "score": max(0, min(100, score)),
        "issues": issues,
        "keyword_coverage": round(jd_keyword_coverage * 100, 1)
    }

def calculate_resume_strength(resume_text: str) -> Dict:
    """Calculate overall resume strength."""
    metrics = {
        "length": len(resume_text.split()),
        "has_experience": bool(re.search(r'(experience|worked|role|position)', resume_text.lower())),
        "has_education": bool(re.search(r'(degree|diploma|certificate|university|college|bachelor|master)', resume_text.lower())),
        "has_projects": bool(re.search(r'(project|portfolio|github|deployed|released)', resume_text.lower())),
        "has_achievements": bool(re.search(r'(award|achievement|recognition|promoted|led|managed)', resume_text.lower())),
        "has_certifications": bool(re.search(r'(certified|certification|license)', resume_text.lower())),
    }
    
    strength_score = sum([
        50 if metrics["has_experience"] else 0,
        20 if metrics["has_education"] else 0,
        15 if metrics["has_projects"] else 0,
        10 if metrics["has_achievements"] else 0,
        5 if metrics["has_certifications"] else 0,
    ])
    
    missing = []
    if not metrics["has_experience"]:
        missing.append("Add work experience details")
    if not metrics["has_education"]:
        missing.append("Highlight your education")
    if not metrics["has_projects"]:
        missing.append("Showcase projects and portfolio links")
    if not metrics["has_achievements"]:
        missing.append("Include measurable achievements and metrics")
    if not metrics["has_certifications"]:
        missing.append("Add relevant certifications")
    
    return {
        "score": strength_score,
        "metrics": metrics,
        "missing_sections": missing,
        "word_count": metrics["length"]
    }

def extract_text_from_file(filename: str, content: bytes) -> str:
    name = filename.lower()
    try:
        if name.endswith(".pdf"):
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(content))
            return "\n".join([p.extract_text() or "" for p in reader.pages]).strip()
        elif name.endswith(".docx"):
            import docx
            doc = docx.Document(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs).strip()
        else:
            return content.decode("utf-8", errors="ignore").strip()
    except Exception as e:
        print(f"Extraction error: {e}")
        return ""

async def get_ai_feedback(resume_text: str, jd_text: str) -> dict:
    """Get structured JSON feedback from Gemini with a local fallback if quota is hit."""
    if not API_KEY:
        return get_local_fallback_analysis(resume_text, jd_text)
        
    prompt = f"""
    You are an expert recruiter and resume analyst. Analyze this resume against the job description.
    
    Resume (first 8000 chars):
    {resume_text[:8000]}
    
    Job Description (first 4000 chars):
    {jd_text[:4000]}
    
    Respond with ONLY a raw JSON object (no markdown backticks) with this exact structure:
    {{
        "matching_skills": ["skills found in both resume and JD"],
        "missing_skills": ["critical skills in JD but not in resume"],
        "feedback_summary": "2-3 sentence assessment of fit",
        "improvement_tips": ["tip 1", "tip 2", "tip 3"],
        "tailored_bullets": ["rewritten bullet point 1", "rewritten bullet point 2"],
        "strengths": ["strength 1", "strength 2"],
        "concerns": ["concern 1", "concern 2"]
    }}
    """
    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-1.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        result = json.loads(response.text.strip())
        # Ensure all fields exist
        for key in ["matching_skills", "missing_skills", "feedback_summary", "improvement_tips", "tailored_bullets", "strengths", "concerns"]:
            if key not in result:
                result[key] = []
        return result
    except Exception as e:
        print(f"Gemini Error: {e}")
        return get_local_fallback_analysis(resume_text, jd_text)

def get_local_fallback_analysis(resume: str, jd: str) -> dict:
    """Provides analysis without needing API credits."""
    # Extract all skills from both texts
    resume_skills = extract_skills_from_text(resume)
    jd_skills = extract_skills_from_text(jd)
    
    # Find matching and missing skills
    all_resume_skills = set()
    all_jd_skills = set()
    
    for skills_list in resume_skills.values():
        all_resume_skills.update(skills_list)
    for skills_list in jd_skills.values():
        all_jd_skills.update(skills_list)
    
    matching = list(all_resume_skills & all_jd_skills)[:10]
    missing = list(all_jd_skills - all_resume_skills)[:10]
    
    return {
        "matching_skills": matching,
        "missing_skills": missing,
        "feedback_summary": "Local analysis: Good resume-JD alignment. Focus on highlighting the missing skills or demonstrating related capabilities.",
        "improvement_tips": [
            "Add specific metrics and numbers to your achievements (e.g., 'increased performance by 30%')",
            "Incorporate more keywords from the job description naturally",
            "Highlight the missing skills above, or mention related experience"
        ],
        "tailored_bullets": [
            "Led development of [project] using [relevant technologies] with measurable business impact",
            "Implemented [feature/improvement] resulting in [quantifiable benefit]"
        ],
        "strengths": [
            f"Strong foundation in {matching[0] if matching else 'key technologies'}",
            "Clear demonstration of relevant experience"
        ],
        "concerns": [
            f"Consider addressing these missing skills: {', '.join(missing[:3]) if missing else 'none'}",
            "Ensure achievements are quantified with metrics"
        ]
    }

@app.post("/api/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    jd: str = Form(...)
):
    # 1. Extract Text
    content = await resume.read()
    resume_text = extract_text_from_file(resume.filename, content)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from the resume.")

    try:
        # 2. Compute Match Score LOCALLY (Free & Unlimited)
        def compute_local_score():
            embeddings = embed_model.encode([resume_text, jd])
            v1, v2 = embeddings[0], embeddings[1]
            similarity = float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
            return similarity

        semantic_score = await asyncio.to_thread(compute_local_score)
        
        # Scale to human-friendly 0-100
        normalized_score = max(0, min(100, int((semantic_score - 0.2) / 0.7 * 100)))

        # 3. Get AI Analysis (With Fallback)
        ai_data = await get_ai_feedback(resume_text, jd)

        # 4. Calculate additional metrics
        ats_compliance = calculate_ats_compliance_score(resume_text, jd)
        resume_strength = calculate_resume_strength(resume_text)
        
        # Extract skills
        resume_skills = extract_skills_from_text(resume_text)
        jd_skills = extract_skills_from_text(jd)

        return {
            "score": normalized_score,
            "semantic_similarity": round(semantic_score, 3),
            "ai_analysis": ai_data,
            "ats_compliance": ats_compliance,
            "resume_strength": resume_strength,
            "skills": {
                "found": resume_skills,
                "required": jd_skills
            },
            "mode": "advanced"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/skills")
async def get_all_skills():
    """Return all available skills in the database."""
    return {"skills": ADVANCED_SKILLS}

@app.post("/api/skill-gap-analysis")
async def skill_gap_analysis(resume: UploadFile = File(...), jd: str = Form(...)):
    """Detailed skill gap analysis with recommendations."""
    content = await resume.read()
    resume_text = extract_text_from_file(resume.filename, content)
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract resume text")
    
    resume_skills = extract_skills_from_text(resume_text)
    jd_skills = extract_skills_from_text(jd)
    
    # Flatten and find gaps
    all_resume_skills = set()
    all_jd_skills = set()
    
    for skills_list in resume_skills.values():
        all_resume_skills.update(skills_list)
    for skills_list in jd_skills.values():
        all_jd_skills.update(skills_list)
    
    gaps = list(all_jd_skills - all_resume_skills)
    overlap = list(all_resume_skills & all_jd_skills)
    extra = list(all_resume_skills - all_jd_skills)
    
    return {
        "skill_overlap": overlap,
        "skill_gaps": gaps,
        "extra_skills": extra,
        "gap_percentage": round((len(gaps) / max(len(all_jd_skills), 1)) * 100, 1),
        "coverage_percentage": round((len(overlap) / max(len(all_jd_skills), 1)) * 100, 1)
    }

@app.post("/api/resume-audit")
async def resume_audit(resume: UploadFile = File(...)):
    """Comprehensive resume quality audit."""
    content = await resume.read()
    resume_text = extract_text_from_file(resume.filename, content)
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract resume text")
    
    strength = calculate_resume_strength(resume_text)
    
    # Additional metrics
    sentences = [s.strip() for s in re.split(r'[.!?]+', resume_text) if s.strip()]
    avg_sentence_length = np.mean([len(s.split()) for s in sentences]) if sentences else 0
    
    # Action verb count
    action_verbs = ["developed", "designed", "implemented", "led", "managed", "improved", 
                    "created", "built", "launched", "optimized", "delivered", "spearheaded",
                    "accelerated", "collaborated", "pioneered", "orchestrated"]
    action_verb_count = sum(resume_text.lower().count(verb) for verb in action_verbs)
    
    # Metrics/numbers
    numbers = re.findall(r'\d+(?:%|[KM$])?|\$\d+', resume_text)
    
    return {
        "strength_score": strength["score"],
        "metrics": strength["metrics"],
        "recommendations": strength["missing_sections"],
        "quality_metrics": {
            "word_count": strength["word_count"],
            "sentence_count": len(sentences),
            "avg_sentence_length": round(avg_sentence_length, 1),
            "action_verb_count": action_verb_count,
            "quantifiable_metrics_count": len(numbers),
            "has_contact_info": bool(re.search(r'\S+@\S+\.\S+', resume_text))
        },
        "suggestions": [
            f"Add more action verbs (found {action_verb_count}, aim for 15+)" if action_verb_count < 15 else f"Great use of action verbs ({action_verb_count})",
            f"Include quantifiable metrics (found {len(numbers)}, aim for 10+)" if len(numbers) < 10 else f"Good metrics coverage ({len(numbers)} metrics)",
            "Use bullet points for better readability" if len(sentences) > 50 else "Bullet point structure looks good"
        ]
    }

@app.post("/api/interview-prep")
async def interview_prep(resume: UploadFile = File(...), jd: str = Form(...)):
    """Generate interview preparation tips based on resume and JD."""
    content = await resume.read()
    resume_text = extract_text_from_file(resume.filename, content)
    
    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract resume text")
    
    # Extract key topics from JD
    jd_lower = jd.lower()
    topics = []
    
    if "leadership" in jd_lower or "lead" in jd_lower:
        topics.append("Leadership and team management")
    if "agile" in jd_lower or "scrum" in jd_lower:
        topics.append("Agile/Scrum methodologies")
    if "cloud" in jd_lower or "aws" in jd_lower or "azure" in jd_lower or "gcp" in jd_lower:
        topics.append("Cloud technologies and deployment")
    if "data" in jd_lower or "analytics" in jd_lower:
        topics.append("Data analysis and insights")
    if "security" in jd_lower or "compliance" in jd_lower:
        topics.append("Security and compliance")
    
    return {
        "interview_topics": topics if topics else ["General technical discussion", "Project highlights", "Problem-solving approach"],
        "star_stories": [
            "Prepare a STAR story (Situation, Task, Action, Result) about your biggest achievement",
            "Have 2-3 examples ready demonstrating the key skills from the job description",
            "Practice explaining your technical decisions and trade-offs"
        ],
        "questions_to_ask": [
            "What does success look like in this role?",
            "What are the biggest challenges the team is facing?",
            "How does this role contribute to the team's goals?",
            "What's the tech stack and architecture decisions you're proud of?",
            "How does the team handle code review and knowledge sharing?"
        ]
    }

