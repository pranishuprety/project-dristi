// 🔓 Make initMap visible for Google Maps callback
function initMap() {
    const defaultCenter = { lat: 40.7128, lng: -74.0060 };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: defaultCenter,
    });
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.setCenter(userLocation);
          new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "You are here",
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to fetch your location.");
        }
      );
    } else {
      alert("Geolocation not supported.");
    }
  }
  
  window.initMap = initMap;
  
  window.onload = function () {
    console.log("🌐 DOM Loaded");
  
    const voiceButton = document.getElementById("voiceButton");
    const voiceOutput = document.getElementById("voiceOutput");
  
    let mediaRecorder;
    let chunks = [];
  
    if (!voiceButton || !voiceOutput) {
      console.error("❌ voiceButton or voiceOutput not found in DOM");
      return;
    }
  
    voiceButton.addEventListener("click", async () => {
      voiceOutput.innerText = "🎙️ Recording...";
  
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
      } catch (err) {
        console.error("❌ Could not access microphone:", err);
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
          console.log("🤖 AI response:", reply);
          voiceOutput.innerText = `🤖 ${reply}`;
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(reply));
        } catch (err) {
          console.error("❌ Transcription or fetch failed:", err);
          voiceOutput.innerText = "❌ Error communicating with assistant.";
        }
      };
  
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 4000); // ⏱️ Record for 4 seconds
    });
  
    // Distance + direction updater
    setInterval(() => {
      fetch("/api/data")
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("distance").textContent = "Distance: " + data.distance;
          document.getElementById("direction").textContent = "Direction: " + data.direction;
        })
        .catch((err) => {
          console.warn("⚠️ /api/data fetch failed:", err);
        });
    }, 10000);
  };
  