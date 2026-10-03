@echo off
echo Starting Voice Coach Full Stack Application...
start "Voice Coach Backend" cmd /k "%~dp0run_backend.bat"
start "Voice Coach Frontend" cmd /k "%~dp0run_frontend.bat"
echo Both servers are starting up.
echo Backend:  http://localhost:8000 (Docs: http://localhost:8000/docs)
echo Frontend: http://localhost:3000
