# Voice Coach AI

AI-powered speech coaching web application that analyzes both voice and content to provide personalized feedback.

## Features

- 🎙️ **Record directly from browser** — speak into your microphone
- 📊 **5-dimension radar chart** — visual breakdown of speaking skills
- 🤖 **AI-powered feedback** — actionable recommendations in Thai
- 📋 **3 coaching presets** — Meeting/Report, Public Speaking, MC/Host
- 📈 **Progress tracking** — compare scores over time
- 📥 **Export reports** — download as Markdown or JSON

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS + Chart.js |
| Backend | FastAPI + Pydantic v2 + SQLAlchemy |
| Audio | librosa + FFmpeg |
| Thai NLP | PyThaiNLP |
| AI | OpenAI / Anthropic / Google Gemini (configurable) |
| STT | OpenAI Whisper API |
| Database | SQLite |

## Prerequisites

- **Python** 3.11+
- **Node.js** 20+
- **FFmpeg** 6+ (must be in PATH)

## Quick Start (รันในเครื่องง่ายๆ เพียงดับเบิลคลิกเดียว)

### 🚀 วิธีเปิดใช้งานแบบ 1-Click (แนะนำสำหรับ Windows):
เพียงดับเบิลคลิกไฟล์:
- **`start_all.bat`** — ระบบจะเปิดทั้ง Backend (FastAPI) และ Frontend (Next.js) ให้โดยอัตโนมัติ พร้อมเปิดเบราว์เซอร์เข้าหน้าเว็บทันทีที่ `http://localhost:3000`
- **`stop_all.bat`** — ปิดเซิร์ฟเวอร์ทั้งหมดอย่างปลอดภัยเมื่อใช้งานเสร็จ

---

### หรือรันด้วยคำสั่ง Terminal:

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Open the App

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Choose a preset** — Select the type of speech you want to analyze
2. **Record your speech** — Click the microphone button and speak
3. **Review transcript** — Edit the auto-generated transcript if needed
4. **Get analysis** — Click "วิเคราะห์การพูด" to start analysis
5. **Review results** — See your scores, radar chart, and AI feedback

## API Documentation

Once the backend is running, visit:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Project Structure

```
Voice_Coach/
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/ # React components
│   │   ├── hooks/     # Custom hooks
│   │   └── lib/       # Utilities & types
│   └── package.json
├── backend/           # FastAPI app
│   ├── app/
│   │   ├── api/       # REST endpoints
│   │   ├── models/    # Database models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic
│   │   ├── presets/   # Coaching presets
│   │   ├── prompts/   # LLM prompt templates
│   │   └── utils/     # Utilities
│   └── requirements.txt
└── README.md
```

## Privacy

- Audio is **not stored** by default after analysis
- Transcripts may be sent to third-party STT/LLM services
- Users can delete their analysis data at any time
- No health, personality, or employment evaluations are made

## License

Private — All rights reserved.
