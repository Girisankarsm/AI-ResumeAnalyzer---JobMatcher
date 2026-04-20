import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("Testing gemini-2.5-flash...")
    model = genai.GenerativeModel("gemini-2.5-flash")
    result = model.generate_content("Hello")
    print("Success text:", result.text)
except Exception as e:
    print(f"Error: {e}")
