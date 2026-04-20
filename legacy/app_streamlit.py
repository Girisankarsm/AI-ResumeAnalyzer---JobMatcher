# app.py
#https://github.com/Girisankarsm/AI-ResumeAnalyzer---JobMatcher/edit/main/app.py
import io, re, json, os
from dotenv import load_dotenv
from typing import List, Tuple
import streamlit as st
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from google import genai
from google.genai import types
from matplotlib.backends.backend_pdf import PdfPages
import numpy as np

# ----------------- Gemini Config -----------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=GEMINI_API_KEY)
# ----------------- Streamlit Config -----------------
st.set_page_config(page_title="AI Resume Analyzer", page_icon="🧠", layout="wide")

# ----------------- Skills -----------------
SKILLS = {
    "programming": ["python","java","javascript","typescript","c","c++","c#","go","rust","scala","kotlin"],
    "data & ml": ["pandas","numpy","scikit-learn","tensorflow","pytorch","matplotlib","seaborn","xgboost","sql"],
    "web & backend": ["flask","django","fastapi","node.js","express","spring","docker","kubernetes","aws","azure","gcp","linux"],
    "soft": ["communication","leadership","problem solving","teamwork","agile","scrum"]
}
ALL_SKILLS = sorted({s for g in SKILLS.values() for s in g})

# ================== Helpers ==================
def read_file(upload) -> str:
    if not upload: return ""
    name = (upload.name or "").lower()
    data = upload.read()
    if name.endswith(".pdf"):
        from PyPDF2 import PdfReader
        reader = PdfReader(io.BytesIO(data))
        return "\n".join([p.extract_text() or "" for p in reader.pages])
    if name.endswith(".docx"):
        import docx
        doc = docx.Document(io.BytesIO(data))
        return "\n".join(p.text for p in doc.paragraphs)
    return data.decode("utf-8", errors="ignore")

def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower())

def find_skills(text: str) -> List[str]:
    t = " " + normalize(text) + " "
    hits = []
    for sk in ALL_SKILLS:
        if f" {sk} " in t or re.search(rf"\b{re.escape(sk)}\b", t):
            hits.append(sk)
    return sorted(set(hits))

def compute_match(resume_text: str, jd_text: str) -> Tuple[float, List[Tuple[str,float]]]:
    docs = [normalize(resume_text), normalize(jd_text)]
    vec = TfidfVectorizer(ngram_range=(1,2), stop_words="english")
    X = vec.fit_transform(docs)
    score = float(cosine_similarity(X[0], X[1])[0,0])
    feats = vec.get_feature_names_out()
    w_res, w_jd = X[0].toarray()[0], X[1].toarray()[0]
    contrib = (w_res * w_jd)
    top_idx = contrib.argsort()[-15:][::-1]
    return score, [(feats[i], float(contrib[i])) for i in top_idx if contrib[i] > 0]

def gpt_feedback(resume: str, jd: str, match_score: float, skills_found, missing_skills):
    prompt = f"""
You are an expert technical recruiter.
Analyze this resume vs the job description and rate it on a scale of 0–100.

Resume:
{resume[:4000]}

Job Description:
{jd[:4000]}

Analytical match score: {match_score*100:.1f}%
Skills found: {', '.join(skills_found)}
Missing skills: {', '.join(missing_skills)}

Please provide:
1. A clear rating (0–100)
2. 3–4 detailed suggestions to improve the resume
3. 2 sample bullet points to make it stronger
Return as markdown.
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text.strip()

# ================== Session State ==================
for key in ["resume_text", "jd_text", "pdf_buffer"]:
    if key not in st.session_state:
        st.session_state[key] = None

# ================== Sidebar Navigation ==================
tab = st.sidebar.radio("Navigation", ["Upload Resume", "Paste Job Description", "Analyze", "About"])
st.sidebar.markdown("---")
st.sidebar.markdown("💡 Tip: Resume, JD, and PDF report are persistent across tabs.")

# ----------------- Upload Resume -----------------
if tab == "Upload Resume":
    uploaded_file = st.file_uploader("📄 Upload Resume (PDF/DOCX/TXT)", type=["pdf","docx","txt"])
    if uploaded_file: 
        st.session_state.resume_text = read_file(uploaded_file)
        st.success("✅ Resume uploaded successfully!" if st.session_state.resume_text else "❌ Failed to read resume.")

# ----------------- Paste Job Description -----------------
elif tab == "Paste Job Description":
    st.session_state.jd_text = st.text_area(
        "📋 Paste Job Description", 
        value=st.session_state.jd_text or "",
        height=250, 
        placeholder="Paste the JD here..."
    )

# ----------------- Analyze -----------------
elif tab == "Analyze":
    if not st.session_state.resume_text or not st.session_state.jd_text:
        st.warning("⚠️ Please upload a resume and paste a JD first.")
    else:
        resume_text = st.session_state.resume_text
        jd_text = st.session_state.jd_text

        with st.spinner("🚀 Analyzing Resume..."):
            score, top_terms = compute_match(resume_text, jd_text)
            r_sk, j_sk = set(find_skills(resume_text)), set(find_skills(jd_text))
            matching_sk, missing_sk = sorted(r_sk & j_sk), sorted(j_sk - r_sk)

        # --- Match Score ---
        st.subheader("📊 Match Score")
        st.progress(int(score*100))
        st.metric("TF-IDF Match", f"{score*100:.1f}%")

        # --- Skills Coverage Bar Chart ---
        st.subheader("✅ Matching vs Missing Skills")
        coverage = pd.DataFrame({
            "Skills": ["Matching", "Missing"],
            "Count": [len(matching_sk), len(missing_sk)]
        })
        fig, ax = plt.subplots()
        sns.barplot(x="Skills", y="Count", data=coverage, palette=["#1f77b4","#ff69b4"], ax=ax)
        st.pyplot(fig, clear_figure=True)

        # --- Skills Radar Chart ---
        st.subheader("📡 Skill Coverage Radar")
        categories = ['programming','data & ml','web & backend','soft']
        r_values = []
        for cat in categories:
            cat_skills = set(SKILLS[cat])
            r_values.append(len(cat_skills & r_sk)/len(cat_skills))
        angles = np.linspace(0, 2*np.pi, len(categories), endpoint=False).tolist()
        r_values += r_values[:1]
        angles += angles[:1]

        fig2, ax2 = plt.subplots(figsize=(6,6), subplot_kw=dict(polar=True))
        ax2.plot(angles, r_values, 'o-', linewidth=2, color="#1f77b4")
        ax2.fill(angles, r_values, alpha=0.25, color="#1f77b4")
        ax2.set_thetagrids(np.degrees(angles[:-1]), categories)
        ax2.set_ylim(0,1)
        st.pyplot(fig2, clear_figure=True)

        # --- Top TF-IDF Keywords ---
        st.subheader("🔑 Top Matching Keywords")
        keywords = pd.DataFrame(top_terms, columns=["Keyword","Score"])
        fig3, ax3 = plt.subplots(figsize=(8,4))
        sns.barplot(x="Score", y="Keyword", data=keywords, palette="coolwarm", ax=ax3)
        st.pyplot(fig3, clear_figure=True)

        # --- Gemini AI Feedback ---
        st.subheader("🧠 AI Resume Feedback")
        feedback = gpt_feedback(resume_text, jd_text, score, matching_sk, missing_sk)
        with st.expander("View AI Feedback"):
            st.markdown(feedback)

        # --- PDF Export ---
        st.subheader("📄 Export PDF Report")
        if st.session_state.pdf_buffer is None:
            pdf_buffer = io.BytesIO()
            with PdfPages(pdf_buffer) as pdf:
                fig.savefig(pdf, format='pdf')
                fig2.savefig(pdf, format='pdf')
                fig3.savefig(pdf, format='pdf')
                plt.figure(figsize=(8,4))
                plt.axis('off')
                plt.text(0.01, 0.99, feedback, fontsize=12, verticalalignment='top', wrap=True)
                pdf.savefig()
                plt.close()
            st.session_state.pdf_buffer = pdf_buffer

        st.download_button(
            "⬇️ Download Full PDF Report",
            st.session_state.pdf_buffer,
            file_name="resume_analysis.pdf",
            mime="application/pdf"
        )

# ----------------- About -----------------
elif tab == "About":
    st.markdown("""
    **AI Resume Analyzer & Job Matcher**  
    - Uses **TF-IDF similarity** for base score  
    - Extracts skills using regex  
    - Provides **Google Gemini AI feedback**  
    - Interactive charts: bar + radar chart  
    - PDF export of full report (persistent across tabs)  
    - Fully built with **Streamlit**, **Matplotlib**, **Seaborn**
    """)

# ----------------- Footer / Credits -----------------
st.markdown("---")
st.markdown(
    """
    <div style="text-align:center; font-size:14px; color:gray;">
    Built by| 
    <a href="https://www.linkedin.com/in/girisankar-s-m/" target="_blank">LinkedIn</a> | 
    <a href="https://github.com/Girisankarsm" target="_blank">GitHub</a>
    </div>
    """, 
    unsafe_allow_html=True
)
