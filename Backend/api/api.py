# api/api.py

import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS

from app.parser import extract_text, extract_text_from_docx
from app.preprocessor import clean_text
from app.matcher import match_resumes

from app.insights import (
    extract_contextual_skills,
    load_skills_catalog,
    compute_readability,
    keyword_density
)

app = Flask(__name__)
CORS(app)

# Load skills catalog once at startup
SKILLS_CATALOG_PATH = os.path.join(os.path.dirname(__file__), '../data/skills_catalog.csv')
skills_catalog = load_skills_catalog(SKILLS_CATALOG_PATH)

@app.route('/match', methods=['POST'])
def match_api():
    resumes = request.files.getlist('resumes')  # get all resumes
    jd_file = request.files.get('job_description')

    if not jd_file or not resumes:
        return jsonify({'error': 'Missing job description or resumes'}), 400

    if jd_file.filename.endswith(".docx"):
        temp_jd = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
        jd_file.save(temp_jd.name)
        jd_text = extract_text(temp_jd.name)
        os.remove(temp_jd.name)
    else:
        jd_text = jd_file.read().decode('utf-8')
    matches = []

    for resume_file in resumes:
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        resume_file.save(temp.name)
        temp.close()

        resume_text = extract_text(temp.name)
        cleaned_resume = clean_text(resume_text)
        cleaned_jd = clean_text(jd_text)
        score = match_resumes(cleaned_resume, cleaned_jd)

        matches.append({
            'filename': resume_file.filename,
            'score': round(score * 100, 2)
        })

        os.remove(temp.name)

    return jsonify({'matches': matches})

@app.route('/analyze', methods=['POST'])
def analyze_resumes():
    resumes = request.files.getlist('resumes')
    jd_file = request.files.get('job_description')

    if not jd_file or not resumes:
        return jsonify({'error': 'Missing job description or resumes'}), 400

    # Extract JD text
    if jd_file.filename.endswith(".docx"):
        temp_jd = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
        jd_file.save(temp_jd.name)
        jd_text = extract_text(temp_jd.name)
        os.remove(temp_jd.name)
    else:
        jd_text = jd_file.read().decode('utf-8')

    cleaned_jd = clean_text(jd_text)

    # ✅ Extract JD keywords directly from the skills catalog
    jd_keywords = {skill for skill in skills_catalog if skill.lower() in cleaned_jd.lower()}

    results = []

    for resume_file in resumes:
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        resume_file.save(temp.name)
        temp.close()

        resume_text = extract_text(temp.name)
        os.unlink(temp.name)

        cleaned_resume = clean_text(resume_text)

        # ✅ Extract matched skills (intersection of JD keywords & resume text)
        matched_skills = {skill for skill in jd_keywords if skill.lower() in cleaned_resume.lower()}

        readability = compute_readability(resume_text)
        keyword_stats = keyword_density(resume_text, jd_keywords)

        results.append({
            'filename': resume_file.filename,
            'matched_skills': list(matched_skills),  # convert set → list for JSON
            'readability': readability,
            'keyword_density': keyword_stats
        })

    return jsonify({'results': results})

if __name__ == "__main__":
    app.run(debug=True)
