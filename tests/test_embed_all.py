import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

models = ["models/text-embedding-004", "models/embedding-001", "models/gemini-embedding-004"]
for m in models:
    try:
        res = genai.embed_content(model=m, content="Hello")
        print(f"SUCCESS: {m}")
    except Exception as e:
        print(f"FAILED {m}: {e}")
