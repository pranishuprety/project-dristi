# 🦯 Project Dristi — Smart Cane & Assistive App for the Visually Impaired

Hi, we are **Team Dristi**.  
We created two powerful and independent tools that enhance safety, navigation, and communication for the visually impaired:

- 🦯 **iSight Cane** – a smart Raspberry Pi-powered walking cane
- 📱 **Dristi App** – a web-based assistive assistant built with Flask and React

These systems **work independently** — but like an Apple Watch and iPhone, they **work even better together**.

---

## 🦯 iSight Cane — Affordable Smart Navigation

The **iSight Cane** is designed to reduce the cost of accessible technology:

- 💸 **>90% cheaper** than commercial smart canes (under $100 vs. $1000+)
- 🧠 **Built with Raspberry Pi 4**, ultrasonic sensor, buzzer, haptic motor
- 🛑 Alerts the user with **vibration and sound** when an obstacle is detected within ~50cm
- 🌍 Sends sensor data to the Dristi App if connected via WiFi
- ⚡ Standalone functionality (no app required)

---

## 🧠 Dristi App — Voice-Based Assistive Web App

The **Dristi App** is a fully functional assistive web tool built with:

- 💻 **HTML, CSS, JavaScript** (frontend)  
- 🐍 **Python + Flask** (backend)

Key Features:
- 🗺️ Real-time **live location tracking**
- 🧭 Voice-guided **compass navigation**
- 🆘 Emergency **SOS alerts**
- ☁️ **Weather and hazard** notifications
- 🧠 Conversational **AI voice assistant**
- 📄 Scene understanding via **image-to-text** and **PDF-to-speech**

The app can work standalone — or receive real-time updates from the iSight Cane.

---

## 🔗 Live Demo

🌐 [Backend Live on Render](https://project-dristi.onrender.com)

---

## 🛠️ Technologies Used

- **Hardware**: Raspberry Pi 4, Ultrasonic Sensor, Buzzer, Haptic Motor
- **Backend**: Flask, Vosk (for speech-to-text), Transformers, gTTS
- **Frontend**: HTML, CSS, JavaScript (React optional)
- **Hosting**: Render (Standard Plan)

---

## 🤝 Team

- Pranish Uprety  
- Himal Gautam
- Shardul Aryal
- Dikxant Bhandari

---

## 📦 How to Run (Local)

```bash
git clone https://github.com/pranishuprety/project-dristi.git
cd smart-cane-app
pip install -r requirements.txt
python app.py
