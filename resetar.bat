@echo off
echo.
echo ==========================================
echo    RESETAR DADOS - Meus Habitos
echo ==========================================
echo.
echo ATENCAO: Isso vai ZERAR todos os dados!
echo.
echo  - Todos os dias (habitos, sono, agua, refeicoes, treinos)
echo  - Estudo biblico (volta ao dia 1)
echo  - Lei da atracao (progresso diario)
echo.
echo  MANTIDOS: habitos configurados e afirmacoes
echo  Um BACKUP sera criado automaticamente.
echo.
set /p confirm=Tem certeza? Digite SIM para confirmar: 
if /i not "%confirm%"=="SIM" (
    echo.
    echo Cancelado. Nada foi alterado.
    echo.
    pause
    exit /b
)
echo.
cd /d "G:\Meu Drive\Habitos"
node resetar-dados.js
echo.
pause
