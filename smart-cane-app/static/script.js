let map;
let mapCenter = { lat: 0, lng: 0 };

// 🗺️ Initialize Google Map (called by Maps API callback)
function initMap() {
  const defaultCenter = { lat: 40.7128, lng: -74.0060 };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: defaultCenter,
  });

  getLocation(); // Safe to call after map is initialized
}

window.initMap = initMap; // Needed for Maps API callback to work

// 🗣️ Text-to-Speech
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

// 📍 Get User Location + Marker + Reverse Geocode
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        if (map) {
          map.setCenter(mapCenter);
          new google.maps.Marker({
            position: mapCenter,
            map: map,
            title: "You are here",
          });
        }
        getLocationName(mapCenter.lat, mapCenter.lng);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to fetch your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
      }
    );
  } else {
    alert("Geolocation not supported.");
  }
}

// 🧠 Convert lat/lng to address
function getLocationName(lat, lng) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    const address = (status === "OK" && results[0]) ? results[0].formatted_address : "Unknown";
    const locSpan = document.getElementById("locationName");
    if (locSpan) locSpan.innerText = address;

    const lastKnown = document.getElementById("lastKnownLocation");
    if (lastKnown) lastKnown.innerText = address;
  });
}

// 🔊 Speak current location
function speakLocation() {
  const location = document.getElementById("locationName")?.innerText || "Unknown";
  speak("You are at " + location);
}

// 🖼️ OCR with Tesseract
function processImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    Tesseract.recognize(reader.result, "eng", {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => {
        console.log("OCR Text:", text);
        speak(text);
      })
      .catch((err) => {
        console.error("OCR Error:", err);
        speak("Sorry, I couldn't read the text.");
      });
  };
  reader.readAsDataURL(file);
}

// 🎙️ Voice Assistant Integration
window.onload = function () {
  console.log("🌐 DOM Loaded");

  const voiceButton = document.getElementById("voiceButton");
  const voiceOutput = document.getElementById("voiceOutput");

  let mediaRecorder;
  let chunks = [];

  if (voiceButton && voiceOutput) {
    voiceButton.addEventListener("click", async () => {
      voiceOutput.innerText = "🎙️ Recording...";

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
      } catch (err) {
        console.error("❌ Mic access failed:", err);
        voiceOutput.innerText = "❌ Microphone error.";
        return;
      }

      chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "input.webm");

        voiceOutput.innerText = "📤 Sending to assistant...";

        try {
          const response = await fetch("/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          const reply = data.response || "No response from assistant.";
          voiceOutput.innerText = `🤖 ${reply}`;
          speak(reply);
        } catch (err) {
          console.error("❌ Transcription fetch failed:", err);
          voiceOutput.innerText = "❌ Assistant error.";
        }
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 4000);
    });
  }

  // 🔁 Periodic hazard data polling
  setInterval(() => {
    fetch("/api/data")
      .then((response) => response.json())
      .then((data) => {
        const distanceEl = document.getElementById("distance");
        const directionEl = document.getElementById("direction");
        if (distanceEl) distanceEl.textContent = "Distance: " + data.distance;
        if (directionEl) directionEl.textContent = "Direction: " + data.direction;
      })
      .catch((err) => {
        console.warn("⚠️ /api/data fetch failed:", err);
      });
  }, 10000);
};
