# app/parser.py

import os
from docx import Document
from pdfminer.high_level import extract_text as extract_pdf_text

def extract_text_from_docx(file_path):
    """Extract text from a DOCX file."""
    try:
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"[DOCX ERROR] {file_path} -> {e}")
        return ""

def extract_text_from_pdf(file_path):
    """Extract text from a PDF file."""
    try:
        return extract_pdf_text(file_path)
    except Exception as e:
        print(f"[PDF ERROR] {file_path} -> {e}")
        return ""

def extract_text(file_path):
    """Determine file type and extract text accordingly."""
    if file_path.endswith(".docx"):
        return extract_text_from_docx(file_path)
    elif file_path.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    else:
        print(f"[UNSUPPORTED FILE] {file_path}")
        return ""

def extract_job_description(jd_path):
    """Read a plain text job description file."""
    try:
        with open(jd_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"[JD ERROR] {jd_path} -> {e}")
        return ""