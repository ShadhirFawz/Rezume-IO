# api/api.py

import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS

from app.parser import extract_text, extract_text_from_docx
from app.preprocessor import clean_text
from app.matcher import match_resumes

app = Flask(__name__)
CORS(app)  # Allow React frontend to communicate

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

if __name__ == "__main__":
    app.run(debug=True)
