/* ============================================
   ResumeMate Pro — Full Feature Script
   Dark/Light Mode · LinkedIn Import · Cover Letter
   Live Progress · Radar Chart · Mobile Nav
   ============================================ */

// ============================================
// THEME — DARK / LIGHT MODE
// ============================================

const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// Restore saved theme
applyTheme(localStorage.getItem('theme') || 'dark');

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ============================================
// MOBILE NAV — HAMBURGER
// ============================================

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
});

// Close nav on link click
navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navMenu.classList.remove('open'));
});

// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// ============================================
// INPUT MODE — FILE vs LINKEDIN
// ============================================

let inputMode = 'file';  // 'file' | 'linkedin'
let linkedinResumeText = null;  // text imported from LinkedIn

function switchInputMode(mode) {
    inputMode = mode;
    const fileWrap = document.getElementById('file-input-wrap');
    const linkedinWrap = document.getElementById('linkedin-input-wrap');
    const modeFile = document.getElementById('mode-file');
    const modeLinkedin = document.getElementById('mode-linkedin');

    if (mode === 'file') {
        fileWrap.style.display = 'block';
        linkedinWrap.classList.remove('visible');
        modeFile.classList.add('active');
        modeLinkedin.classList.remove('active');
    } else {
        fileWrap.style.display = 'none';
        linkedinWrap.classList.add('visible');
        modeLinkedin.classList.add('active');
        modeFile.classList.remove('active');
    }
}

// LinkedIn Import Button
document.getElementById('linkedin-import-btn').addEventListener('click', async () => {
    const url = document.getElementById('linkedin-url').value.trim();
    const status = document.getElementById('linkedin-status');

    if (!url || !url.includes('linkedin.com')) {
        status.textContent = '⚠️ Please enter a valid LinkedIn profile URL';
        status.style.color = 'var(--danger)';
        return;
    }

    const btn = document.getElementById('linkedin-import-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
    btn.disabled = true;
    status.textContent = '';

    try {
        const formData = new FormData();
        formData.append('url', url);

        const res = await fetch('/api/linkedin-import', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success && data.profile_text) {
            linkedinResumeText = data.profile_text;
            status.textContent = `✅ Imported ${data.profile_text.split(' ').length} words from LinkedIn profile`;
            status.style.color = 'var(--success)';
        } else {
            throw new Error(data.detail || 'Could not import profile');
        }
    } catch (err) {
        status.textContent = `❌ ${err.message}. Try downloading your LinkedIn profile as PDF and uploading instead.`;
        status.style.color = 'var(--danger)';
    } finally {
        btn.innerHTML = '<i class="fab fa-linkedin"></i> Import Profile Text';
        btn.disabled = false;
    }
});

// ============================================
// FILE UPLOAD — DRAG & DROP
// ============================================

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('resume');
const fileNameDisplay = document.getElementById('file-name');

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        fileNameDisplay.textContent = `📄 ${e.target.files[0].name}`;
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(99,102,241,0.12)';
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragging');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        fileNameDisplay.textContent = `📄 ${files[0].name}`;
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(99,102,241,0.12)';
    }
});

// Character counter for JD
document.getElementById('jd').addEventListener('input', (e) => {
    document.getElementById('char-count').textContent = e.target.value.length;
});

// ============================================
// LIVE PROGRESS STEPS
// ============================================

const STEPS = ['step-extract', 'step-embed', 'step-ai', 'step-ats'];

function resetSteps() {
    STEPS.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('active', 'done');
    });
}

function activateStep(index) {
    if (index > 0) {
        document.getElementById(STEPS[index - 1]).classList.remove('active');
        document.getElementById(STEPS[index - 1]).classList.add('done');
        document.getElementById(STEPS[index - 1]).querySelector('.step-icon i').className = 'fas fa-check';
    }
    if (index < STEPS.length) {
        document.getElementById(STEPS[index]).classList.add('active');
    }
}

function completeAllSteps() {
    STEPS.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('active');
        el.classList.add('done');
        el.querySelector('.step-icon i').className = 'fas fa-check';
    });
}

async function runProgressAnimation(fetchPromise) {
    resetSteps();
    activateStep(0);

    let stepIndex = 0;
    const intervals = [900, 2200, 4000, 5500];  // ms delays per step

    const timers = intervals.map((delay, i) =>
        setTimeout(() => activateStep(i + 1), delay)
    );

    try {
        const result = await fetchPromise;
        timers.forEach(clearTimeout);
        completeAllSteps();
        await new Promise(r => setTimeout(r, 500));
        return result;
    } catch (err) {
        timers.forEach(clearTimeout);
        throw err;
    }
}

// ============================================
// FORM SUBMISSION & ANALYSIS
// ============================================

let lastResumeFile = null;
let lastJDText = '';

document.getElementById('analyze-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const jdText = document.getElementById('jd').value.trim();

    // Validate inputs based on mode
    if (inputMode === 'file') {
        if (!fileInput.files[0]) {
            showNotification('Please upload a resume file', 'error');
            return;
        }
    } else {
        if (!linkedinResumeText) {
            showNotification('Please import your LinkedIn profile first', 'error');
            return;
        }
    }

    if (!jdText) {
        showNotification('Please paste a job description', 'error');
        return;
    }

    lastJDText = jdText;
    if (inputMode === 'file') lastResumeFile = fileInput.files[0];

    const resultsPanel = document.getElementById('results-panel');
    const progressOverlay = document.getElementById('progress-overlay');
    const resultsContainer = document.getElementById('results-container');

    resultsPanel.style.display = 'block';
    progressOverlay.classList.add('active');
    resultsContainer.style.display = 'none';

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;

    setTimeout(() => resultsPanel.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
        const formData = new FormData();
        formData.append('jd', jdText);

        if (inputMode === 'file') {
            formData.append('resume', fileInput.files[0]);
        } else {
            // Send LinkedIn text as a text file blob
            const blob = new Blob([linkedinResumeText], { type: 'text/plain' });
            formData.append('resume', blob, 'linkedin_profile.txt');
        }

        const fetchPromise = fetch('/api/analyze', { method: 'POST', body: formData })
            .then(async res => {
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.detail || 'Analysis failed');
                }
                return res.json();
            });

        const data = await runProgressAnimation(fetchPromise);

        // Populate all tabs
        populateOverviewTab(data);
        populateSkillsTab(data);
        populateATSTab(data);
        populateStrengthTab(data);
        await populateInterviewTab(formData);
        initCoverLetter();  // Start cover letter generation

        progressOverlay.classList.remove('active');
        resultsContainer.style.display = 'block';

    } catch (error) {
        console.error(error);
        progressOverlay.classList.remove('active');
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
    }
});

// ============================================
// TAB SWITCHING
// ============================================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});

// ============================================
// POPULATE OVERVIEW TAB
// ============================================

function populateOverviewTab(data) {
    const score = data.score;

    document.getElementById('match-score').textContent = score;
    updateScoreCircle(score);

    let label = 'Needs Improvement';
    if (score >= 80) label = '🎉 Excellent Match!';
    else if (score >= 60) label = '👍 Good Match';
    else if (score >= 40) label = '⚡ Moderate Match';
    document.getElementById('match-label').textContent = label;

    const atsScore = data.ats_compliance.score;
    const strengthScore = data.resume_strength.score;
    const skillCoverage = data.ats_compliance.keyword_coverage;

    animateBar('ats-fill', atsScore);
    animateBar('strength-fill', strengthScore);
    animateBar('skills-fill', skillCoverage);

    document.getElementById('ats-score').textContent = atsScore;
    document.getElementById('strength-score').textContent = strengthScore;
    document.getElementById('skill-coverage').textContent = skillCoverage;

    const ai = data.ai_analysis;
    populateList('strengths-list', ai.strengths || []);
    populateList('concerns-list', ai.concerns || []);
    document.getElementById('ai-feedback').textContent = ai.feedback_summary || 'No feedback available';
    populateList('improvement-tips', ai.improvement_tips || []);
    populateList('tailored-bullets', ai.tailored_bullets || []);
}

// ============================================
// POPULATE SKILLS TAB + RADAR CHART
// ============================================

let radarChart = null;

function populateSkillsTab(data) {
    const matching = data.ai_analysis.matching_skills || [];
    const missing = data.ai_analysis.missing_skills || [];

    populateTags('matching-skills-container', matching, 'match');
    populateTags('missing-skills-container', missing, 'miss');

    const jdSkills = data.skills.required || {};
    const resumeSkills = data.skills.found || {};

    // Category bar breakdown
    let breakdownHtml = '';
    const radarLabels = [];
    const radarResume = [];
    const radarJD = [];

    for (const [category, skills] of Object.entries(jdSkills)) {
        const found = resumeSkills[category] || [];
        const pct = Math.round((found.length / Math.max(skills.length, 1)) * 100);
        radarLabels.push(category.replace(/_/g, ' '));
        radarResume.push(pct);
        radarJD.push(100);

        breakdownHtml += `
            <div class="skill-category">
                <h5>${category.replace(/_/g, ' ')}</h5>
                <div class="category-bar">
                    <div class="category-fill" style="width:${pct}%"></div>
                </div>
                <span class="category-count">${found.length}/${skills.length} skills</span>
            </div>
        `;
    }
    document.getElementById('skill-breakdown').innerHTML = breakdownHtml;

    // Radar Chart
    buildRadarChart(radarLabels, radarResume);
}

function buildRadarChart(labels, resumeData) {
    const ctx = document.getElementById('skill-radar-chart').getContext('2d');

    if (radarChart) radarChart.destroy();

    const isDark = html.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(15,23,42,0.1)';
    const tickColor = isDark ? '#94a3b8' : '#64748b';

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels.length > 0 ? labels : ['No Skills Data'],
            datasets: [{
                label: 'Your Coverage',
                data: resumeData.length > 0 ? resumeData : [0],
                backgroundColor: 'rgba(99,102,241,0.25)',
                borderColor: 'rgba(99,102,241,0.9)',
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointRadius: 4,
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false },
                    grid: { color: gridColor },
                    angleLines: { color: gridColor },
                    pointLabels: {
                        color: tickColor,
                        font: { size: 11, family: 'Poppins' }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.raw}% coverage`
                    }
                }
            }
        }
    });
}

// Rebuild radar chart on theme change (so colors update)
themeToggle.addEventListener('click', () => {
    if (radarChart) {
        const labels = radarChart.data.labels;
        const data = radarChart.data.datasets[0].data;
        setTimeout(() => buildRadarChart(labels, data), 50);
    }
});

// ============================================
// POPULATE ATS TAB
// ============================================

function populateATSTab(data) {
    const atsScore = data.ats_compliance.score;
    document.getElementById('ats-percentage').textContent = atsScore;
    document.getElementById('ats-progress').style.background = `conic-gradient(
        var(--primary) 0deg,
        var(--secondary) ${(atsScore / 100) * 360}deg,
        rgba(99,102,241,0.1) ${(atsScore / 100) * 360}deg
    )`;

    const issues = data.ats_compliance.issues || [];
    const issuesHtml = issues.length === 0
        ? '<li class="no-issues">✓ No major ATS issues found!</li>'
        : issues.map(i => `<li>⚠️ ${i}</li>`).join('');
    document.getElementById('ats-issues-list').innerHTML = `<ul>${issuesHtml}</ul>`;

    populateList('ats-tips-list', [
        'Use standard fonts like Arial, Calibri, or Times New Roman',
        'Avoid tables, columns, and complex formatting',
        'Use simple bullet points instead of special characters',
        'Include relevant keywords from the job description naturally',
        'Use standard section headings (Experience, Education, Skills)',
        'Save as PDF or DOCX for best compatibility'
    ]);
}

// ============================================
// POPULATE STRENGTH TAB
// ============================================

function populateStrengthTab(data) {
    const strengthScore = data.resume_strength.score;
    document.getElementById('strength-percentage').textContent = strengthScore;
    document.getElementById('strength-progress').style.background = `conic-gradient(
        var(--primary) 0deg,
        var(--secondary) ${(strengthScore / 100) * 360}deg,
        rgba(99,102,241,0.1) ${(strengthScore / 100) * 360}deg
    )`;

    const metrics = data.resume_strength.metrics || {};
    const wordCount = data.resume_strength.word_count || 0;

    let html = `<div class="metric-item">
        <i class="fas fa-file-lines"></i>
        <span>Word Count: <strong>${wordCount}</strong> (Target: 400–600)</span>
    </div>`;

    [
        { name: 'Work Experience', key: 'has_experience' },
        { name: 'Education', key: 'has_education' },
        { name: 'Projects', key: 'has_projects' },
        { name: 'Achievements', key: 'has_achievements' },
        { name: 'Certifications', key: 'has_certifications' }
    ].forEach(s => {
        const ok = metrics[s.key];
        html += `<div class="metric-item ${ok ? 'success' : 'warning'}">
            <i class="fas ${ok ? 'fa-check-circle' : 'fa-circle-xmark'}"></i>
            <span>${s.name}</span>
        </div>`;
    });

    document.getElementById('quality-metrics-list').innerHTML = html;
    populateList('missing-sections-list', data.resume_strength.missing_sections || []);
}

// ============================================
// POPULATE INTERVIEW TAB
// ============================================

async function populateInterviewTab(formData) {
    try {
        const res = await fetch('/api/interview-prep', { method: 'POST', body: formData });
        if (res.ok) {
            const d = await res.json();
            populateList('interview-topics-list', d.interview_topics || []);
            populateList('star-stories-list', d.star_stories || []);
            populateList('questions-list', d.questions_to_ask || []);
        }
    } catch (err) {
        console.error('Interview prep error:', err);
    }
}

// ============================================
// COVER LETTER — GENERATE, COPY, DOWNLOAD
// ============================================

function initCoverLetter() {
    document.getElementById('cover-letter-loading').style.display = 'block';
    document.getElementById('cover-letter-content').style.display = 'none';
    generateCoverLetter();
}

async function generateCoverLetter() {
    try {
        const jd = document.getElementById('jd').value;
        const formData = new FormData();
        formData.append('jd', jd);

        if (inputMode === 'file' && lastResumeFile) {
            formData.append('resume', lastResumeFile);
        } else if (linkedinResumeText) {
            const blob = new Blob([linkedinResumeText], { type: 'text/plain' });
            formData.append('resume', blob, 'linkedin_profile.txt');
        } else {
            document.getElementById('cover-letter-text').textContent = 'Resume data not available for cover letter.';
            document.getElementById('cover-letter-loading').style.display = 'none';
            document.getElementById('cover-letter-content').style.display = 'block';
            return;
        }

        const res = await fetch('/api/cover-letter', { method: 'POST', body: formData });

        if (!res.ok) throw new Error('Cover letter generation failed');

        const data = await res.json();
        document.getElementById('cover-letter-text').textContent = data.cover_letter || '';
        document.getElementById('cover-letter-loading').style.display = 'none';
        document.getElementById('cover-letter-content').style.display = 'block';

    } catch (err) {
        document.getElementById('cover-letter-text').textContent =
            'Could not generate cover letter. Please ensure the Gemini API key is set in .env';
        document.getElementById('cover-letter-loading').style.display = 'none';
        document.getElementById('cover-letter-content').style.display = 'block';
    }
}

function copyCoverLetter() {
    const text = document.getElementById('cover-letter-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Cover letter copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Copy failed — please select and copy manually', 'error');
    });
}

function downloadCoverLetter() {
    const text = document.getElementById('cover-letter-text').textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cover_letter.txt';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    showNotification('Cover letter downloaded!', 'success');
}

function regenerateCoverLetter() {
    document.getElementById('cover-letter-loading').style.display = 'block';
    document.getElementById('cover-letter-content').style.display = 'none';
    generateCoverLetter();
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function updateScoreCircle(score) {
    const circle = document.getElementById('score-circle');
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (score / 100) * circumference;
    setTimeout(() => { circle.style.strokeDashoffset = offset; }, 100);
    if (score >= 75) circle.style.stroke = 'var(--success)';
    else if (score >= 50) circle.style.stroke = 'var(--warning)';
    else circle.style.stroke = 'var(--danger)';
}

function animateBar(id, pct) {
    const el = document.getElementById(id);
    setTimeout(() => { el.style.width = pct + '%'; }, 150);
}

function populateTags(containerId, items, type) {
    const el = document.getElementById(containerId);
    if (!items || items.length === 0) {
        el.innerHTML = '<span style="color:var(--text-muted)">None found</span>';
        return;
    }
    const color = type === 'miss' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)';
    const border = type === 'miss' ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)';
    el.innerHTML = items.map(i =>
        `<span class="tag" style="background:${color};border-color:${border}">${i}</span>`
    ).join('');
}

function populateList(containerId, items) {
    const el = document.getElementById(containerId);
    if (!items || items.length === 0) { el.innerHTML = ''; return; }
    el.innerHTML = items.map(i => `<li>${i}</li>`).join('');
}

function showError(message) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = `
        <div style="text-align:center;padding:3rem;color:var(--danger)">
            <i class="fas fa-circle-exclamation" style="font-size:3rem;margin-bottom:1rem;display:block"></i>
            <h3>Analysis Failed</h3>
            <p style="color:var(--text-secondary);margin:0.75rem 0 2rem">${message}</p>
            <button onclick="location.reload()" class="submit-button" style="max-width:280px;margin:0 auto">
                <span>Try Again</span>
                <i class="fas fa-redo"></i>
            </button>
        </div>
    `;
    resultsContainer.style.display = 'block';
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

console.log('✨ ResumeMate Pro loaded — all features active!');
