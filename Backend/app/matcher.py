# app/matcher.py

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def match_resumes(resume_text, job_description):
    """
    Compares a single resume to a job description using TF-IDF and cosine similarity.
    Returns a similarity score (0 to 1).
    """
    documents = [job_description, resume_text]
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    return similarity[0][0]  # float score
