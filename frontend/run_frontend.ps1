# Cineverse Discovery - Frontend Runner Script (PowerShell)
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  CINEVERSE DISCOVERY - VITE REACT FRONTEND" -ForegroundColor Gold
Write-Host "======================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

if (-not (Test-Path ".\node_modules")) {
    Write-Host "[!] Installing node dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "[*] Launching Vite development server on http://localhost:5173 ..." -ForegroundColor Green
npm run dev
