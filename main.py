from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from openai import OpenAI
from dotenv import load_dotenv
from typing import Optional
import base64
import os

# ===================== ENV =====================
load_dotenv(override=True)
OPENAI__API_KEY = os.getenv("OPENAI__API_KEY")

if not OPENAI__API_KEY:
    raise RuntimeError("OPENAI__API_KEY is not set")

# ===================== OPENAI CLIENT =====================
client = OpenAI(api_key=OPENAI__API_KEY)

# ===================== FASTAPI APP =====================
app = FastAPI(
    title="Disaster Recognition API",
    version="1.0.0",
    description="Multimodal disaster classification (text / image / late fusion)"
)

# ===================== CORS =====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 🔒 production: thay bằng domain frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== STATIC FILES =====================
# Thư mục static phải tồn tại và chứa index.html
app.mount("/static", StaticFiles(directory="static"), name="static")

# ===================== CLASSIFICATION FUNCTIONS =====================
def classify_text(text: str) -> str:
    prompt = f"""
You are a strict NLP classifier.

Output "Informative" if the sentence is related to a real disaster
(earthquake, flood, fire, explosion, epidemic, accident, etc.)
and contains useful factual information.

Otherwise output "Not Informative".

Return ONLY one label.

Sentence:
"{text}"
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a text classification model."},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()


def classify_image(image_bytes: bytes) -> str:
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    prompt = """
You are a strict image classifier.

Output "Informative" if the image shows a real disaster
(flood, fire, explosion, earthquake, collapsed buildings, accident, etc.)
with useful information.

Otherwise output "Not Informative".

Return ONLY one label.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    }
                ]
            }
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()


def late_fusion(text_label: Optional[str], image_label: Optional[str]) -> str:
    """
    Late fusion (OR rule):
    Nếu text hoặc image là Informative → Informative
    """
    if text_label == "Informative" and image_label == "Informative":
        return "Informative"
    return "Not Informative"


# ===================== ROUTES =====================
@app.get("/")
def serve_index():
    """
    Serve giao diện HTML
    """
    return FileResponse("static/index.html")


@app.post("/api/classify")
async def classify_disaster(
    mode: str = Form("both"),
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """
    Classify disaster-related content.

    mode:
    - text
    - image
    - both
    """

    text_label = None
    image_label = None

    try:
        if mode in ["text", "both"] and text:
            text_label = classify_text(text)

        if mode in ["image", "both"] and image:
            image_bytes = await image.read()
            image_label = classify_image(image_bytes)

        final_label = late_fusion(text_label, image_label)

        return JSONResponse(
            content={
                "success": True,
                "mode": mode,
                "results": {
                    "text_label": text_label,
                    "image_label": image_label,
                    "final_label": final_label
                }
            }
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )


# ===================== ENTRY POINT (RENDER SAFE) =====================
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "main:app",   
        host="0.0.0.0",
        port=port,
        reload=False
    )
