@echo off
echo ==================================================
echo       Starting AgriVision AI Full-Stack App     
echo ==================================================

cd /d "%~dp0"

REM 1. Setup Backend
if not exist "backend\.venv" (
    echo Creating Python virtual environment...
    python -m venv backend\.venv
    call backend\.venv\Scripts\activate
    pip install -r backend\requirements.txt
) else (
    call backend\.venv\Scripts\activate
)

REM 2. Setup Frontend
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend && npm install && cd ..
)

REM 3. Start Backend in separate window
echo Starting FastAPI Backend on http://127.0.0.1:8000...
start "AgriVision Backend" cmd /k "cd backend && call .venv\Scripts\activate && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

REM 4. Start Frontend
echo Starting Frontend UI on http://localhost:5173...
cd frontend && npm run dev
