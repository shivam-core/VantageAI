# VantageAI - The Intelligence Layer for AI Prompts

<div align="center">
  <img src="extension/icons/logo.png" alt="VantageAI Logo" width="80" height="80">
  <h1>VantageAI</h1>
  <p><strong>Prompting, Perfected.</strong></p>
  <p>The intelligent layer that sits between you and Gemini, automatically re-engineering your prompts for maximum reasoning.</p>
  
  <a href="#installation">Installation</a> •
  <a href="#features">Features</a> •
  <a href="#usage">Usage</a> •
  <a href="#deployment">Deployment</a>
</div>

---

## 🚀 Features

- **🧠 Intelligent Analysis** - AI analyzes your prompt and applies the optimal framework
- **⚡ One-Click Optimize** - Press `Ctrl+Shift+X` or click the floating V button
- **🎯 Use Case Modes** - Coding, Study, Creative, Reasoning modes
- **📱 Native Integration** - Grammarly-style floating button in Gemini

## 📦 Project Structure

```
VantageAI/
├── extension/          # Chrome Extension
│   ├── manifest.json   # Extension configuration
│   ├── content.js      # Main injection script
│   ├── styles.css      # UI styling
│   ├── popup.html      # Extension popup
│   └── icons/          # Extension icons
├── backend/            # Python FastAPI Backend
│   ├── main.py         # API server
│   ├── rag_engine.py   # Intelligence layer
│   ├── requirements.txt
│   └── .env            # API keys (not committed)
└── landing/            # Marketing landing page
    └── index.html
```

## 🛠 Installation

### Prerequisites
- Python 3.9+
- Chrome Browser
- OpenRouter API Key (for Gemini 2.0 Flash)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```env
GEMINI_API_KEY=your_openrouter_api_key_here
```

Run the server:
```bash
python main.py
```

### Extension Setup

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. Pin the VantageAI extension

## 💡 Usage

1. **Open Gemini** - Go to gemini.google.com
2. **Type a prompt** - Write your question or task
3. **Activate VantageAI** - Click the floating V button or press `Ctrl+Shift+X`
4. **Select options** - Choose Model and Use Case
5. **Click Optimize** - Get your enhanced prompt
6. **Apply Fix** - Insert the optimized prompt into Gemini

## 🌐 Deployment

### Backend (Render)

1. Push to GitHub
2. Connect to Render
3. Set environment variables:
   - `GEMINI_API_KEY`: Your OpenRouter API key
4. Deploy

### Extension

1. Update `API_BASE` in `content.js` to your Render URL
2. Zip the `extension` folder
3. Submit to Chrome Web Store (or distribute manually)

### Landing Page

Host `landing/index.html` on:
- Vercel
- Netlify
- GitHub Pages

## 🔑 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/analyze` | POST | Analyze and optimize prompt |

### Request Body
```json
{
  "raw_text": "your prompt here",
  "app": "gemini",
  "model": "gemini-2.0-flash",
  "use_case": "coding"
}
```

## 📄 License

MIT License - Built for the Google AI Hackathon 2026

---

<div align="center">
  <p>Made with ⚡ by the VantageAI Team</p>
</div>
