@echo off
start cmd /k "cd /d C:\Users\Lenovo\Downloads\mazajp+\source code\backend && if exist .venv\Scripts\activate.bat call .venv\Scripts\activate && python manage.py runserver"

start cmd /k "cd /d C:\Users\Lenovo\Downloads\mazajp+\source code\frontend && npm run dev"
