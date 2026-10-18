@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Installez Node.js 20 ou plus recent, puis relancez ce fichier.
  pause
  exit /b 1
)
start "" http://localhost:4173
node server/server.js
pause
