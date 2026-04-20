/* ResumeMate Pro - Advanced JavaScript */

// ============================================
// FILE UPLOAD HANDLING
// ============================================

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('resume');
const fileNameDisplay = document.getElementById('file-name');

// Click to upload
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        fileNameDisplay.textContent = e.target.files[0].name;
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(99, 102, 241, 0.15)';
    }
});

// Drag and drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragging');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragging');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        fileNameDisplay.textContent = files[0].name;
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(99, 102, 241, 0.15)';
    }
});

// Character counter for JD
document.getElementById('jd').addEventListener('input', (e) => {
    document.getElementById('char-count').textContent = e.target.value.length;
});

// ============================================
// FORM SUBMISSION & ANALYSIS
// ============================================

document.getElementById('analyze-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const resumeFile = fileInput.files[0];
    const jdText = document.getElementById('jd').value;

    if (!resumeFile || !jdText.trim()) {
        showNotification('Please upload a resume and provide a job description', 'error');
        return;
    }

    // Show loading state
    const resultsPanel = document.getElementById('results-panel');
    const loader = document.getElementById('loader');
    const resultsContainer = document.getElementById('results-container');

    resultsPanel.style.display = 'block';
    loader.style.display = 'flex';
    resultsContainer.style.display = 'none';

    // Scroll to results
    setTimeout(() => resultsPanel.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jd', jdText);

        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Analysis failed');
        }

        const data = await response.json();

        // Populate all tabs
        populateOverviewTab(data);
        populateSkillsTab(data);
        populateATSTab(data);
        populateStrengthTab(data);
        await populateInterviewTab(resumeFile, jdText);

        // Show results
        loader.style.display = 'none';
        resultsContainer.style.display = 'block';

    } catch (error) {
        console.error(error);
        showError(error.message);
    }
});

// ============================================
// TAB SWITCHING
// ============================================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        
        // Update active button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Update active panel
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});

// ============================================
// POPULATE OVERVIEW TAB
// ============================================

function populateOverviewTab(data) {
    const score = data.score;
    
    // Update match score with animation
    document.getElementById('match-score').textContent = score;
    updateScoreCircle(score);
    
    // Update match label
    let label = 'Analyzing...';
    if (score >= 80) label = 'Excellent Match!';
    else if (score >= 60) label = 'Good Match';
    else if (score >= 40) label = 'Moderate Match';
    else label = 'Needs Improvement';
    document.getElementById('match-label').textContent = label;

    // Update metrics
    const atsScore = data.ats_compliance.score;
    const strengthScore = data.resume_strength.score;
    const skillCoverage = data.ats_compliance.keyword_coverage;

    animateBar('ats-fill', atsScore);
    animateBar('strength-fill', strengthScore);
    animateBar('skills-fill', skillCoverage);

    document.getElementById('ats-score').textContent = atsScore;
    document.getElementById('strength-score').textContent = strengthScore;
    document.getElementById('skill-coverage').textContent = skillCoverage;

    // Populate lists
    const aiAnalysis = data.ai_analysis;
    populateList('strengths-list', aiAnalysis.strengths || []);
    populateList('concerns-list', aiAnalysis.concerns || []);
    
    document.getElementById('ai-feedback').textContent = aiAnalysis.feedback_summary || 'No feedback';
    populateList('improvement-tips', aiAnalysis.improvement_tips || []);
    populateList('tailored-bullets', aiAnalysis.tailored_bullets || []);
}

// ============================================
// POPULATE SKILLS TAB
// ============================================

function populateSkillsTab(data) {
    const matching = data.ai_analysis.matching_skills || [];
    const missing = data.ai_analysis.missing_skills || [];

    // Populate skill tags
    populateTags('matching-skills-container', matching);
    populateTags('missing-skills-container', missing);

    // Skill breakdown by category
    const jdSkills = data.skills.required || {};
    const resumeSkills = data.skills.found || {};

    let breakdownHtml = '';
    for (const [category, skills] of Object.entries(jdSkills)) {
        const found = resumeSkills[category] || [];
        const percentage = Math.round((found.length / Math.max(skills.length, 1)) * 100);
        
        breakdownHtml += `
            <div class="skill-category">
                <h5>${category.replace(/_/g, ' ')}</h5>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="category-count">${found.length}/${skills.length} skills</span>
            </div>
        `;
    }
    document.getElementById('skill-breakdown').innerHTML = breakdownHtml;
}

// ============================================
// POPULATE ATS TAB
// ============================================

function populateATSTab(data) {
    const atsScore = data.ats_compliance.score;
    const issues = data.ats_compliance.issues || [];

    // Update ATS gauge
    const atsPercentage = document.getElementById('ats-percentage');
    atsPercentage.textContent = atsScore;
    
    const atsProgress = document.getElementById('ats-progress');
    const atsGauge = document.querySelector('.ats-gauge');
    atsProgress.style.background = `conic-gradient(
        var(--primary) 0deg,
        var(--secondary) ${(atsScore / 100) * 360}deg,
        rgba(99, 102, 241, 0.1) ${(atsScore / 100) * 360}deg
    )`;

    // Issues list
    const issuesHtml = issues.length === 0 
        ? '<li class="no-issues">✓ No major ATS issues found!</li>'
        : issues.map(issue => `<li>⚠️ ${issue}</li>`).join('');
    document.getElementById('ats-issues-list').innerHTML = issuesHtml;

    // Tips
    const atsTips = [
        'Use standard fonts like Arial, Calibri, or Times New Roman',
        'Avoid tables, columns, and complex formatting',
        'Use simple bullet points instead of special characters',
        'Include relevant keywords from the job description',
        'Use standard section headings (Experience, Education, Skills)',
        'Save as PDF or DOCX for best compatibility',
        'Keep a simple one-column layout'
    ];
    populateList('ats-tips-list', atsTips);
}

// ============================================
// POPULATE STRENGTH TAB
// ============================================

function populateStrengthTab(data) {
    const strengthScore = data.resume_strength.score;
    
    // Update gauge
    document.getElementById('strength-percentage').textContent = strengthScore;
    const strengthProgress = document.getElementById('strength-progress');
    strengthProgress.style.background = `conic-gradient(
        var(--primary) 0deg,
        var(--secondary) ${(strengthScore / 100) * 360}deg,
        rgba(99, 102, 241, 0.1) ${(strengthScore / 100) * 360}deg
    )`;

    // Quality metrics
    const metrics = data.resume_strength.metrics || {};
    const wordCount = data.resume_strength.word_count || 0;

    let metricsHtml = `
        <div class="metric-item">
            <i class="fas fa-file-lines"></i>
            <span>Word Count: <strong>${wordCount}</strong> words (Target: 400-500)</span>
        </div>
    `;

    const sections = [
        { name: 'Experience', key: 'has_experience' },
        { name: 'Education', key: 'has_education' },
        { name: 'Projects', key: 'has_projects' },
        { name: 'Achievements', key: 'has_achievements' },
        { name: 'Certifications', key: 'has_certifications' }
    ];

    sections.forEach(section => {
        const hasIt = metrics[section.key];
        const icon = hasIt ? 'fa-check-circle success' : 'fa-circle-xmark warning';
        metricsHtml += `
            <div class="metric-item ${hasIt ? 'success' : 'warning'}">
                <i class="fas ${icon}"></i>
                <span>${section.name}</span>
            </div>
        `;
    });

    document.getElementById('quality-metrics-list').innerHTML = metricsHtml;

    // Missing sections
    populateList('missing-sections-list', data.resume_strength.missing_sections || []);
}

// ============================================
// POPULATE INTERVIEW TAB
// ============================================

async function populateInterviewTab(resumeFile, jdText) {
    try {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jd', jdText);

        const response = await fetch('/api/interview-prep', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            populateList('interview-topics-list', data.interview_topics || []);
            populateList('star-stories-list', data.star_stories || []);
            populateList('questions-list', data.questions_to_ask || []);
        }
    } catch (error) {
        console.error('Interview prep error:', error);
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function updateScoreCircle(score) {
    const circle = document.getElementById('score-circle');
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (score / 100) * circumference;
    
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);

    // Color based on score
    if (score >= 75) {
        circle.style.stroke = 'var(--success)';
    } else if (score >= 50) {
        circle.style.stroke = 'var(--warning)';
    } else {
        circle.style.stroke = 'var(--danger)';
    }
}

function animateBar(elementId, percentage) {
    const element = document.getElementById(elementId);
    setTimeout(() => {
        element.style.width = percentage + '%';
    }, 100);
}

function populateTags(containerId, items) {
    const container = document.getElementById(containerId);
    if (!items || items.length === 0) {
        container.innerHTML = '<span style="color: var(--text-muted);">None found</span>';
        return;
    }
    container.innerHTML = items.map(item => `<span class="tag">${item}</span>`).join('');
}

function populateList(containerId, items) {
    const container = document.getElementById(containerId);
    if (!items || items.length === 0) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

function showError(message) {
    const resultsContainer = document.getElementById('results-container');
    const resultsPanel = document.getElementById('results-panel');
    const loader = document.getElementById('loader');

    loader.style.display = 'none';
    
    let errorHtml = `
        <div style="text-align: center; padding: 3rem; color: var(--danger);">
            <i class="fas fa-circle-exclamation" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>Analysis Failed</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="submit-button" style="margin-top: 2rem; max-width: 300px;">
                <span>Try Again</span>
                <i class="fas fa-redo"></i>
            </button>
        </div>
    `;

    resultsContainer.innerHTML = errorHtml;
    resultsContainer.style.display = 'block';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === 'error' ? 'var(--danger)' : 'var(--success)'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add gradient SVG for score ring
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
gradient.setAttribute('id', 'scoreGradient');
gradient.setAttribute('x1', '0%');
gradient.setAttribute('y1', '0%');
gradient.setAttribute('x2', '100%');
gradient.setAttribute('y2', '100%');

const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stop1.setAttribute('offset', '0%');
stop1.setAttribute('stop-color', 'var(--primary)');

const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
stop2.setAttribute('offset', '100%');
stop2.setAttribute('stop-color', 'var(--secondary)');

gradient.appendChild(stop1);
gradient.appendChild(stop2);
svg.appendChild(gradient);

const svgElements = document.querySelectorAll('svg');
if (svgElements.length > 0) {
    svgElements[0].appendChild(svg);
}

console.log('✨ ResumeMate Pro loaded successfully!');
