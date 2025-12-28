from openai import OpenAI
from dotenv import load_dotenv
import base64
import os

# ===================== ENV =====================
load_dotenv(override=True)
OPENAI__API_KEY = os.getenv("OPENAI__API_KEY")

# ===================== OPENAI CLIENT =====================
client = OpenAI(api_key=OPENAI__API_KEY)

# ===================== IMAGE UTILS =====================
def encode_image(image_path: str) -> str:
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

# ===================== TEXT CLASSIFIER =====================
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

# ===================== IMAGE CLASSIFIER =====================
def classify_image(image_path: str) -> str:
    image_base64 = encode_image(image_path)

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

# ===================== LATE FUSION =====================
def late_fusion(text_label: str, image_label: str) -> str:
    if text_label == "Informative" and image_label == "Informative":
        return "Informative"
    return "Not Informative"

# ===================== MAIN =====================
if __name__ == "__main__":
    print("🔹 Disaster Multimodal Classifier (Late Fusion)")
    print("🔹 Type 'exit' to quit\n")

    while True:
        mode = input("Choose input type (text / image / both): ").lower()

        if mode == "exit":
            break

        text_label = "Not Informative"
        image_label = "Not Informative"

        if mode in ["text", "both"]:
            text = input("Enter English sentence: ")
            text_label = classify_text(text)
            print(f"📝 Text result: {text_label}")

        if mode in ["image", "both"]:
            image_path = input("Enter image file path: ")
            image_label = classify_image(image_path)
            print(f"🖼 Image result: {image_label}")

        final_label = late_fusion(text_label, image_label)
        print(f"✅ Final result (Late Fusion): {final_label}\n")

    print("👋 Bye!")
