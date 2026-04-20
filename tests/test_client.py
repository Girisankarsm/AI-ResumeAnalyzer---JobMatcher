import requests
import time

url = "http://127.0.0.1:8002/api/analyze"
jd = """
Job Title: Full-Stack Software Engineer
We are looking for a highly skilled Full-Stack Software Engineer to join our core product team.
Key Responsibilities:
- Design, build, and maintain efficient, reusable, and reliable Python code using FastAPI or Django.
- Develop dynamic, responsive user interfaces using React.js or modern Vanilla JavaScript (ES6+).
Requirements:
- 3+ years of professional experience in full-stack web development.
- Strong proficiency in Python and familiarity with asynchronous programming.
- Experience with cloud platforms like AWS.
"""

print("Sending request to standard analyzer...")
try:
    with open("test_resume.txt", "rb") as f:
        files = {"resume": ("resume.txt", f, "text/plain")}
        data = {"jd": jd}
        
        start = time.time()
        response = requests.post(url, files=files, data=data)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            print(f"SUCCESS in {elapsed:.2f}s!")
            import json
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"FAILED in {elapsed:.2f}s with status {response.status_code}")
            print(response.text)
except Exception as e:
    print("Request failed entirely:", e)
