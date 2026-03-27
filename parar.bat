@echo off
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
echo Servidor parado.
timeout /t 2 /nobreak >nul
