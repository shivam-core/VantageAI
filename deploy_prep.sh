#!/bin/bash
echo "🚀 Preparing VantageAI for Deployment..."

# 1. Initialize Git
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git Initialized."
else
    echo "✅ Git already initialized."
fi

# 2. Configure .gitignore (Protect API Keys)
cat > .gitignore << 'EOF'
# Environment & Secrets
.env
*.env

# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
env/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Debug files
debug_*.py
find_*.py
force_*.py
test_*.py

# Build
dist/
build/
*.egg-info/
EOF
echo "✅ .gitignore Created."

# 3. Add Files
git add .
echo "✅ Files staged."

# 4. Commit
git commit -m "🚀 VantageAI Release v1.0 - Production Ready"
echo "✅ Committed."

echo ""
echo "🎉 READY! Now follow these steps:"
echo ""
echo "1. Create a NEW repository on GitHub (don't add README)"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/VantageAI.git"
echo "3. Run: git branch -M main"
echo "4. Run: git push -u origin main"
echo ""
echo "5. Go to render.com and deploy the 'backend' folder"
echo "6. Set GEMINI_API_KEY in Render environment variables"
echo ""
