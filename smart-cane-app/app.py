from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from transformers import pipeline
import time
import random
import whisper
import tempfile
import fitz  # PyMuPDF for PDF reading
from gtts import gTTS
from io import BytesIO

# Load models
whisper_model = whisper.load_model("base")
qa_pipeline = pipeline("text2text-generation", model="google/flan-t5-small")

# Flask app setup
app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/data")
def api_data():
    time.sleep(0.5)
    distance = random.randint(1, 100)
    direction = random.choice(["North", "South", "East", "West"])
    return jsonify(distance=distance, direction=direction)

@app.route("/voice_assistant", methods=["POST"])
def voice_assistant():
    data = request.get_json()
    user_input = data.get("text", "")
    try:
        result = qa_pipeline(user_input)[0]['generated_text']
        return jsonify({'response': result})
    except Exception as e:
        return jsonify({'error': 'Model processing failed', 'details': str(e)}), 500

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    audio_file = request.files["audio"]
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        audio_path = tmp.name
        audio_file.save(audio_path)

    try:
        result = whisper_model.transcribe(audio_path)
        transcript = result["text"]
        response = qa_pipeline(f"Answer helpfully: {transcript}")[0]["generated_text"]
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": "Transcription failed", "details": str(e)}), 500

# PDF to text route
@app.route('/pdf-to-text', methods=['POST'])
def pdf_to_text():
    pdf_file = request.files['file']
    doc = fitz.open(stream=pdf_file.read(), filetype='pdf')
    text = ''.join(page.get_text() for page in doc)
    return jsonify({'text': text})

# Text-to-speech route
@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    text = request.json['text']
    tts_audio = BytesIO()
    gTTS(text=text, lang='en').write_to_fp(tts_audio)
    tts_audio.seek(0)
    return send_file(tts_audio, mimetype='audio/mp3', download_name='speech.mp3')

# Run server
if __name__ == "__main__":
    app.run(debug=True)