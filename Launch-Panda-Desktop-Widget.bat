@echo off
title NICE CXone ZEL Panda Desktop Widget Launcher
cd /d "%~dp0"

echo ======================================================================
echo    Starting NICE CXone ZEL Copilot Desktop Widget and System Tray
echo ======================================================================

:: 1. Check if Node.js server is already active on port 4000
netstat -ano | findstr /R /C:":4000 .*LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Backend server is already running on http://localhost:4000
) else (
    echo [*] Starting Node.js backend server in background...
    start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Set-Location '%~dp0'; node server.js"
    ping -n 3 127.0.0.1 >nul
)

:: 2. Launch Native Windows Floating Panda Widget and System Tray Icon (Silently in background)
echo [*] Launching Desktop Floating Widget and Toolbar Hidden Tray Icon...
start "" powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -Command "Set-Location '%~dp0'; & '.\desktop-widget.ps1'"

echo.
echo ======================================================================
echo  [SUCCESS] Panda Floating Widget is now active on your laptop screen!
echo  - Look at the bottom-right of your screen for the floating Panda.
echo  - Look in your Windows Taskbar "Hidden Icons" area for the Panda icon.
echo  - Left-click the Panda to open Copilot; drag it anywhere on screen!
echo  - Right-click either icon for quick menu (Portal, Supervisor, Home).
echo ======================================================================
ping -n 3 127.0.0.1 >nul
exit
