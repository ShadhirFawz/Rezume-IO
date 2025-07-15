# app/preprocessor.py

import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

STOPWORDS = set(stopwords.words("english"))

def clean_text(text):
    """
    Clean and preprocess the input text:
    - Lowercase
    - Remove punctuation/numbers
    - Remove stopwords
    - Tokenize
    """
    # 1. Lowercase
    text = text.lower()

    # 2. Remove non-alphabetic characters (punctuation, numbers)
    text = re.sub(r"[^a-z\s]", "", text)

    # 3. Tokenize
    words = word_tokenize(text)

    # 4. Remove stopwords
    words = [word for word in words if word not in STOPWORDS and len(word) > 1]

    return " ".join(words)
