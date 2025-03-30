from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import time
import random
import whisper
import tempfile

whisper_model = whisper.load_model("base")  # Load Whisper model for ASR (if needed for future use)

# Set Flask app directory structure
app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Load Hugging Face model once
qa_pipeline = pipeline("text2text-generation", model="google/flan-t5-small")

# Home route → loads your frontend HTML
@app.route("/")
def index():
    return render_template("index.html")

# API: real-time dummy sensor data
@app.route("/api/data")
def api_data():
    time.sleep(0.5)  # Simulate delay
    distance = random.randint(1, 100)
    direction = random.choice(["North", "South", "East", "West"])
    return jsonify(distance=distance, direction=direction)

# Voice assistant route
@app.route("/voice_assistant", methods=["POST"])
def voice_assistant():
    data = request.get_json()
    user_input = data.get("text", "")
    print("🧠 Received voice input:", user_input)

    try:
        result = qa_pipeline(user_input)[0]['generated_text']
        return jsonify({'response': result})
    except Exception as e:
        return jsonify({'error': 'Model processing failed', 'details': str(e)}), 500


@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        print("❌ No audio found in request.")
        return jsonify({"error": "No audio file uploaded"}), 400

    audio_file = request.files["audio"]
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        audio_path = tmp.name
        audio_file.save(audio_path)
        print("📥 Audio saved to:", audio_path)

    try:
        print("🧠 Starting Whisper transcription...")
        result = whisper_model.transcribe(audio_path)
        transcript = result["text"]
        print("🗣️ Transcript:", transcript)

        response = qa_pipeline(f"Answer helpfully: {transcript}")[0]["generated_text"]
        print("🤖 AI response:", response)
        return jsonify({"response": response})
    except Exception as e:
        import traceback
        traceback.print_exc()  # 🔥 show full traceback in terminal
        return jsonify({"error": "Transcription failed", "details": str(e)}), 500

# Run server
if __name__ == "__main__":
    app.run(debug=True)
