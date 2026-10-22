@echo off
title Stop NICE CXone ZEL Panda Desktop Widget
cd /d "%~dp0"

echo ======================================================================
echo    Stopping NICE CXone ZEL Ask Shankar Desktop Widget and Services
echo ======================================================================

:: 1. Terminate PowerShell desktop widget processes
powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*desktop-widget.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: 2. Terminate node server on port 4000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":4000 .*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [OK] Floating widget, toolbar tray icon, and backend server have been stopped.
ping -n 3 127.0.0.1 >nul
exit
