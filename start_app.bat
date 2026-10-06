@echo off
chcp 65001 > nul
echo ====================================================
echo  Starting Staff Evaluation Portal...
echo ====================================================
cd /d "%~dp0"
python server.py
pause
