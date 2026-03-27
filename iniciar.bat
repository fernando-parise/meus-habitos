@echo off
cd /d "G:\Meu Drive\Habitos"
echo CreateObject("Wscript.Shell").Run "cmd /c cd /d ""G:\Meu Drive\Habitos"" && node server.js", 0, False > "%temp%\habitos_start.vbs"
wscript "%temp%\habitos_start.vbs"
timeout /t 2 /nobreak >nul
start http://localhost:3000
