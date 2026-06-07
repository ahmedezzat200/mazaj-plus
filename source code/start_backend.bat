@echo off
cd /d "%~dp0backend"

IF EXIST .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
)

python manage.py runserver

pause
