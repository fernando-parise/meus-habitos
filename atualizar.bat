@echo off
cd /d "G:\Meu Drive\Habitos"
echo.
echo === Meus Habitos - Atualizar GitHub ===
echo.
git status --short
echo.
set /p msg="Mensagem do commit: "
if "%msg%"=="" set msg=Atualizacao do projeto
git add -A
git commit -m "%msg%"
git push
echo.
echo Pronto! Codigo atualizado no GitHub.
pause
