#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=================================================="
echo "      🌱 Starting AgriVision AI Full-Stack App     "
echo "=================================================="

# 1. Setup Backend Python Virtual Environment
if [ ! -d "backend/.venv" ]; then
    echo "Creating Python virtual environment in backend/.venv..."
    python3 -m venv backend/.venv
    source backend/.venv/bin/activate
    pip install -r backend/requirements.txt
else
    source backend/.venv/bin/activate
fi

# 2. Setup Frontend dependencies if missing
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm --prefix frontend install
fi

# Cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down AgriVision servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 3. Start Backend Server
echo "🚀 Starting FastAPI Backend on http://127.0.0.1:8000..."
cd "$DIR/backend"
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
cd "$DIR"

# Wait for backend health
echo "Waiting for AI model to load..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8000/api/health > /dev/null; then
        echo "✅ AI Model & Backend Ready at http://127.0.0.1:8000 (API Docs: /docs)"
        break
    fi
    sleep 1
done

# 4. Start Frontend Vite Server
echo "🌿 Starting Frontend UI on http://localhost:5173..."
npm --prefix frontend run dev -- --host 0.0.0.0 --port 5173

wait
