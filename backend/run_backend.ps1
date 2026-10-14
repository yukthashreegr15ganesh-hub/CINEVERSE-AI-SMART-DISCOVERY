# Cineverse Discovery - Backend Runner Script (PowerShell)
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  CINEVERSE DISCOVERY - FASTAPI BACKEND SERVER" -ForegroundColor Gold
Write-Host "======================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "[!] Virtual environment not detected. Creating .venv..." -ForegroundColor Yellow
    python -m venv .venv
    .\.venv\Scripts\pip install -r requirements.txt
}

Write-Host "[*] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Write-Host "[*] Interactive Swagger UI: http://127.0.0.1:8000/docs" -ForegroundColor Gray
.\.venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
