# from app.parser import extract_text, extract_job_description
# import os

# # Read job description
# jd = extract_job_description("data/job_description.txt")
# print("Job Description:\n", jd)

# # Read resumes
# print("\n--- Resumes ---\n")
# for file in os.listdir("resumes"):
#     path = os.path.join("resumes", file)
#     text = extract_text(path)
#     print(f"\n{file}:\n{text}")  # Show first 500 chars only


# from app.parser import extract_text, extract_job_description
# from app.preprocessor import clean_text
# import os

# # Read and clean JD
# jd = extract_job_description("data/job_description.txt")
# cleaned_jd = clean_text(jd)
# print("Cleaned JD:\n", cleaned_jd)

# # Read and clean resumes
# print("\n--- Cleaned Resumes ---\n")
# for file in os.listdir("resumes"):
#     path = os.path.join("resumes", file)
#     raw = extract_text(path)
#     cleaned = clean_text(raw)
#     print(f"\n{file}:\n{cleaned[:500]}")

# test_matcher.py

# from app.parser import extract_text, extract_job_description
# from app.preprocessor import clean_text
# from app.matcher import match_resumes
# import os

# # Step 1: Clean the JD
# job_desc_raw = extract_job_description("data/job_description.txt")
# cleaned_jd = clean_text(job_desc_raw)

# # Step 2: Clean all resumes
# resumes_folder = "resumes"
# cleaned_resumes = {}

# for file in os.listdir(resumes_folder):
#     if file.endswith(".pdf"):
#         path = os.path.join(resumes_folder, file)
#         text = extract_text(path)
#         cleaned = clean_text(text)
#         cleaned_resumes[file] = cleaned

# # Step 3: Match resumes
# results = match_resumes(cleaned_jd, cleaned_resumes)

# # Step 4: Print ranked results
# print("\n📄 Resume Match Scores:\n")
# for filename, score in results:
#     print(f"{filename}: {score}% match")

import requests

# Configuration
API_URL = "http://127.0.0.1:5000/analyze"
RESUME_PATH = "resumes/Shadhir_Resume.pdf"  # Make sure this exists
JD_PATH = "data/job_description.txt"       # Or a .docx if available

def test_analyze_resume():
    with open(RESUME_PATH, 'rb') as resume_file, open(JD_PATH, 'rb') as jd_file:
        files = {
            'resume': resume_file,
            'job_description': jd_file
        }

        print(f"Sending resume: {RESUME_PATH} and JD: {JD_PATH} to /analyze...")
        response = requests.post(API_URL, files=files)

        if response.status_code == 200:
            data = response.json()
            print("\n✅ Analysis Results:\n")

            print("🧠 Matched Skills:")
            for skill in data['matched_skills']:
                print(f" - {skill}")

            print("\n📊 Readability:")
            print(f" - Flesch Score: {data['readability']['flesch_score']}")
            print(f" - Grade Level: {data['readability']['grade_level']}")

            print("\n🔑 Keyword Density (Top Keywords):")
            for kw in data['keyword_density']:
                print(f" - {kw['keyword']}: {kw['count']} ({kw['percentage']}%)")

        else:
            print(f"\n❌ Error {response.status_code}: {response.text}")

if __name__ == "__main__":
    test_analyze_resume()