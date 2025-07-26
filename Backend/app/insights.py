# File: Resume_Matcher/Backend/app/insights.py

import re
import string
from collections import Counter
import textstat
from sentence_transformers import SentenceTransformer, util
import torch

model = SentenceTransformer('all-MiniLM-L6-v2')  # lightweight & accurate

def load_skills_catalog(path):
    with open(path, 'r', encoding='utf-8') as file:
        skills = [line.strip().lower() for line in file if line.strip()]
    return set(skills)


def extract_contextual_skills(jd_text, resume_text, top_k=10):
    jd_sentences = jd_text.split('.')  # rough but works
    resume_sentences = resume_text.split('.')

    jd_embeddings = model.encode(jd_sentences, convert_to_tensor=True)
    resume_embeddings = model.encode(resume_sentences, convert_to_tensor=True)

    similarities = util.cos_sim(jd_embeddings, resume_embeddings)
    top_matches = torch.topk(similarities.flatten(), k=top_k)

    matched_phrases = set()
    for index in top_matches.indices:
        jd_idx = index // len(resume_sentences)
        matched_phrases.add(jd_sentences[jd_idx].strip())

    return list(matched_phrases)


def compute_readability(text):
    score = textstat.flesch_reading_ease(text)
    grade = textstat.text_standard(text, float_output=False)
    return {
        "flesch_score": round(score, 2),
        "grade_level": grade
    }


def keyword_density(text, phrases, top_n=10):
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    keyword_counts = Counter()

    for phrase in phrases:
        count = text.count(phrase.lower())
        if count > 0:
            keyword_counts[phrase] += count

    total_keywords = sum(keyword_counts.values())
    top_keywords = keyword_counts.most_common(top_n)

    density_data = [
        {
            "keyword": kw,
            "count": count,
            "percentage": round((count / total_keywords) * 100, 2) if total_keywords > 0 else 0.0
        } for kw, count in top_keywords
    ]
    return density_data


# Optional test
if __name__ == "__main__":
    resume_text = "Experienced Python developer with skills in React, Flask, and MongoDB."
    skills = load_skills_catalog("../data/skills_catalog.csv")
    print("Skills:", extract_contextual_skills(resume_text, skills))
    print("Readability:", compute_readability(resume_text))
    print("Keyword Density:", keyword_density(resume_text, skills))
