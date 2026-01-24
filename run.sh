#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# VantageAI - Quick Start Script
# ═══════════════════════════════════════════════════════════════

echo "⚡ VantageAI - The Grammarly for Prompt Engineering"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Navigate to backend
cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  No .env file found!"
    echo "📝 Creating template .env file..."
    echo 'GEMINI_API_KEY="YOUR_API_KEY_HERE"' > .env
    echo ""
    echo "❗ IMPORTANT: Please edit backend/.env and add your Gemini API key"
    echo "   Get your key at: https://aistudio.google.com/apikey"
    echo ""
    read -p "Press Enter to continue after adding your API key..."
fi

# Check for virtual environment
if [ -d "../.venv" ]; then
    echo "🐍 Activating virtual environment..."
    source ../.venv/bin/activate
elif [ -d ".venv" ]; then
    echo "🐍 Activating virtual environment..."
    source .venv/bin/activate
else
    echo "📦 No virtual environment found. Using system Python."
    echo "   (Recommended: python3 -m venv ../.venv)"
fi

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# Check if port 8000 is in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo ""
    echo "⚠️  Port 8000 is already in use!"
    echo "   Another instance might be running."
    read -p "   Kill existing process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill $(lsof -t -i:8000) 2>/dev/null
        sleep 1
    fi
fi

# Start the server
echo ""
echo "🚀 Starting VantageAI Backend..."
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📡 Server will be available at: http://localhost:8000"
echo "📖 API Docs available at: http://localhost:8000/docs"
echo ""
echo "🔌 Chrome Extension Setup:"
echo "   1. Open chrome://extensions"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Select the 'extension' folder"
echo ""
echo "⌨️  Usage: Press Ctrl+Shift+X on any text input"
echo ""
echo "Press Ctrl+C to stop the server"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Run the server
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
