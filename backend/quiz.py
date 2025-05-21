import json
import random
import secrets
from flask import Flask, request, jsonify, make_response
from transformers import pipeline, MarianMTModel, MarianTokenizer

app = Flask(__name__)

CATEGORIES = [
    "Cultură", "Geografie", "Istorie", "Literatură", "Sport",
    "Religie și Spiritualitate", "Bucătărie și Gastronomie",
    "Muzică și Dans", "Arhitectură și Monumente",
    "Festivaluri și Sărbători", "Folclor și Mitologie"
]

file_path = "filtered_data.jsonl"

try:
    fill_mask = pipeline("fill-mask", model="distilroberta-base", framework="pt")
except Exception as e:
    print("🔥 Error loading NLP model:", e)
    fill_mask = None

try:
    model_name = "Helsinki-NLP/opus-mt-ROMANCE-en"
    translator_tokenizer = MarianTokenizer.from_pretrained(model_name)
    translator_model = MarianMTModel.from_pretrained(model_name)
except Exception as e:
    print("🔥 Error loading translator model:", e)
    translator_tokenizer = None
    translator_model = None

def translate_to_english(text):
    if not translator_tokenizer or not translator_model:
        return "Translation unavailable."
    text = f">>ro<< {text}"
    inputs = translator_tokenizer(text, return_tensors="pt", truncation=True)
    translated = translator_model.generate(**inputs)
    return translator_tokenizer.decode(translated[0], skip_special_tokens=True)

def generate_quiz(category):
    try:
        if category not in CATEGORIES:
            return {"error": "Invalid category"}

        # Load and filter data fresh
        with open(file_path, 'r', encoding='utf-8') as f:
            filtered_data = [
                json.loads(line.strip())
                for line in f
                if json.loads(line.strip()).get("category") == category
            ]

        if not filtered_data:
            return {"message": f"No data found for category: {category}"}

        # Use secrets for true randomness
        selected = secrets.choice(filtered_data)
        text = selected.get("text", "").strip()

        if not text:
            return {"message": "No valid text in selected entry"}

        # Trim text to 50 words max
        words = text.split()
        if len(words) > 50:
            words = words[:50]
        text = " ".join(words)

        eligible_words = [w for w in words if len(w) > 6]
        if not eligible_words:
            return {"message": "No suitable words to mask"}

        masked_word = secrets.choice(eligible_words)
        masked_text = text.replace(masked_word, "_____", 1)

        # Translate full text (original, not masked)
        translated_text = translate_to_english(text)

        # Fill-mask distractors
        distractors = []
        if fill_mask:
            model_text = masked_text.replace("_____", "<mask>")
            results = fill_mask(model_text, top_k=10)
            distractors = list({
                r["token_str"].strip()
                for r in results
                if r["token_str"].strip().lower() != masked_word.lower()
            })
        else:
            distractors = ["Model not available"]

        distractors = distractors[:3]
        options = [masked_word] + distractors
        random.shuffle(options)

        return {
            "question": masked_text,
            "translated": translated_text,
            "options": options,
            "answer": masked_word,
            "category": category
        }

    except Exception as e:
        print("🔥 ERROR in generate_quiz:", e)
        return {"error": "Internal server error"}

@app.after_request
def add_no_cache_headers(response):
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@app.route("/quiz", methods=["POST"])
def quiz_route():
    data = request.get_json()
    category = data.get("category", "")
    # Just read the nonce (to prevent Flask from caching)
    _ = data.get("nonce", None)
    quiz_data = generate_quiz(category)
    response = make_response(jsonify(quiz_data))
    return response

@app.route("/submit_answer", methods=["POST"])
def submit_answer():
    data = request.get_json()
    print("✅ Answer submitted:", data)
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=False)