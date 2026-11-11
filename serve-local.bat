@echo off
REM ═══════════════════════════════════════════════════════════════
REM  serve-local.bat
REM  Simple local web server for Earth's Climate Exhibition.
REM
REM  WHY you might need this:
REM    Modern browsers block Service Workers and some features
REM    when a page is opened as a file:// URL.
REM    Running a tiny local server (http://localhost:8000) avoids
REM    those restrictions and enables PWA installation.
REM
REM  HOW to run:
REM    Double-click this file OR right-click → Run as administrator.
REM    Your browser will open automatically.
REM    Press Ctrl+C in this window to stop the server.
REM
REM  REQUIREMENTS:
REM    Python 3 (free, included with Windows 11 / available from
REM    the Microsoft Store). To check: open a terminal and type:
REM      python --version
REM    If Python is not installed, go to https://python.org/downloads
REM    and install it, then run this file again.
REM ═══════════════════════════════════════════════════════════════

setlocal

REM Change to the folder this batch file lives in
cd /d "%~dp0"

REM Try Python 3 first, then fall back to 'python'
where python3 >nul 2>&1
if %errorlevel% == 0 (
  set PYTHON=python3
) else (
  where python >nul 2>&1
  if %errorlevel% == 0 (
    set PYTHON=python
  ) else (
    echo.
    echo  ERROR: Python is not installed or not on PATH.
    echo.
    echo  Please install Python 3 from https://python.org/downloads
    echo  Make sure to tick "Add Python to PATH" during install.
    echo.
    pause
    exit /b 1
  )
)

REM Open the browser after a short delay (server needs a moment to start)
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8000"

echo.
echo  ════════════════════════════════════════════════
echo   Earth's Climate Exhibition — Local Server
echo  ════════════════════════════════════════════════
echo.
echo   Server running at:  http://localhost:8000
echo   Opening browser...
echo.
echo   Press Ctrl+C to stop the server when you are done.
echo  ════════════════════════════════════════════════
echo.

REM Start the Python HTTP server on port 8000
%PYTHON% -m http.server 8000

pause
