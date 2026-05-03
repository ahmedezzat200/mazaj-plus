@echo off
cd /d C:\Users\Lenovo\Downloads\mazajp+\source code\backend

IF EXIST .venv\Scripts\activate.bat (
    call .venv\Scripts\activate
)

python manage.py runserver

pause
