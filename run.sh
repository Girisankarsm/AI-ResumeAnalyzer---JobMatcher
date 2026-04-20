#!/bin/bash

# 🚀 Resume Intelligence Pro - One Command Startup
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Kill any existing server
pkill -f "uvicorn api:app" 2>/dev/null || true

echo "🚀 Starting Resume Intelligence Pro..."
cd "$ROOT_DIR/backend"
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload &

# Open browser (macOS)
sleep 3
open http://localhost:8000 2>/dev/null || echo "📱 Open http://localhost:8000 in your browser"

# Keep script running
wait
