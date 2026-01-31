import os
import json
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from rag_engine import RAGEngine

# --- CONFIGURATION ---
load_dotenv()
rag = RAGEngine()

# 1. SETUP OPENROUTER
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ ERROR: Missing API Key!")
else:
    print(f"✅ OpenRouter Key: {api_key[:20]}...")

client = OpenAI(
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1"
)
print("✅ Connected to OpenRouter (Gemini 2.0 Flash Unlimited)")
print("🧠 Full Intelligence Layer Active - AI Selects Framework")

app = FastAPI(title="VantageAI Brain - Full Intelligence")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    raw_text: str
    app: str = "gemini"
    model: str = "gemini-2.0-flash"
    use_case: str = "general"


@app.get("/")
async def health():
    return {"status": "VantageAI Brain (Full Intelligence)", "ok": True}


@app.post("/api/analyze")
async def analyze_prompt(request: AnalyzeRequest):
    print(f"🧠 AI Processing: {request.use_case} | Model: {request.model}")

    # 1. Trivial Check
    if rag.detect_trivial(request.raw_text):
        return {
            "success": True,
            "data": {
                "score": 10,
                "diagnosis": "Greeting detected.",
                "optimized_prompt": "Hello! Ready to optimize. Select a Use Case and click Optimize.",
                "diff_summary": "Greeting"
            }
        }

    # 2. Build the META-INSTRUCTIONS
    # This tells the AI *how* to think about the user's specific model/case
    system_instruction = rag.build_meta_system_prompt(
        request.app, request.model, request.use_case
    )

    # 3. RUN THE INTELLIGENCE
    try:
        print(f"☁️ Sending to Gemini 2.0 Flash (OpenRouter)...")
        response = client.chat.completions.create(
            model="google/gemini-2.0-flash-001",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": f"USER RAW INPUT:\n{request.raw_text}"}
            ],
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "VantageAI"
            },
            response_format={"type": "json_object"}
        )

        result_text = response.choices[0].message.content
        
        # Sanitize JSON - remove control characters that break parsing
        import re
        result_text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', result_text)
        
        result = json.loads(result_text)
        print(f"✅ Success! Framework: {result.get('diff_summary the ', 'Unknown')} | Score: {result.get('score', '?')}/10")
        return {"success": True, "data": result}

    except Exception as e:
        print(f"⚠️ Intelligent Engine Failed: {e}")
        return {
            "success": True,
            "data": {
                "score": 0,
                "diagnosis": f"Error: {str(e)[:80]}",
                "optimized_prompt": request.raw_text,
                "diff_summary": "Connection Failed"
            }
        }


if __name__ == "__main__":
    print("🚀 Starting VantageAI Brain (Full Intelligence Layer)...")
    uvicorn.run(app, host="0.0.0.0", port=8000)