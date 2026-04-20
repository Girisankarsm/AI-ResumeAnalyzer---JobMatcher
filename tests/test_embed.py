import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("Testing text-embedding-004...")
    result = genai.embed_content(model="models/text-embedding-004", content="Hello world")
    print("Success text-embedding-004!")
except Exception as e:
    print(f"Error text-embedding-004: {e}")

try:
    print("\nTesting embedding-001...")
    result = genai.embed_content(model="models/embedding-001", content="Hello world")
    print("Success embedding-001!")
except Exception as e:
    print(f"Error embedding-001: {e}")
