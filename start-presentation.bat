@echo off
title Contact Center WFM & Chatbot Presentation Launcher
color 0b
cls
echo =====================================================================
echo    ENTERPRISE CONTACT CENTER WFM & CHATBOT PRESENTATION LAUNCHER
echo =====================================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [ERROR] Node.js is not found on this machine!
    echo Please install Node.js from https://nodejs.org (LTS recommended).
    echo.
    pause
    exit /b 1
)

echo [1/3] Node.js environment detected.
for /f "tokens=*" %%v in ('node -v') do echo       Version: %%v

:: 2. Start Backend Node Server
echo.
echo [2/3] Starting Local Application Server on port 4000...
start "WFM-Server-Backend" /min node server.js
timeout /t 2 /nobreak >nul

:: 3. Check for Cloudflare Tunnel
echo.
echo [3/3] Checking Connectivity Mode...
if exist "cloudflared.exe" (
    echo       [ONLINE MODE] cloudflared.exe detected. Starting automatic tunnel manager...
    start "WFM-Tunnel-Manager" /min node tunnel_manager.js
    timeout /t 3 /nobreak >nul
) else (
    echo       [LOCAL / PRESENTATION MODE] No cloudflared.exe required!
    echo       Direct Wi-Fi / Hotspot presentation mode is ACTIVE.
)

:: 4. Get Local IP for presentation
echo.
echo =====================================================================
echo    READY FOR DEMO / PRESENTATION!
echo =====================================================================
echo.
echo  * Laptop Desktop URL : http://localhost:4000/agent-home.html
echo  * Chatbot Widget URL : http://localhost:4000/widget.html
echo  * Supervisor Portal  : http://localhost:4000/supervisor.html
echo  * Break Request Web  : http://localhost:4000/portal.html
echo.
echo  -------------------------------------------------------------
echo  * MOBILE PHONE PAIRING (ZERO-CLOUDFLARE PRESENTATION MODE):
echo    1. Connect this laptop and your phone to the SAME Wi-Fi
echo       (or turn on your Phone Mobile Hotspot and connect laptop).
echo    2. Open Desktop Widget (http://localhost:4000/widget.html).
echo    3. Scan the QR code or open the Local IP link shown on screen.
echo  -------------------------------------------------------------
echo.

:: 5. Auto open browser
start http://localhost:4000/agent-home.html

echo Press any key to shutdown all demo services...
pause >nul

:: Cleanup on exit
taskkill /f /im node.exe >nul 2>nul
taskkill /f /im cloudflared.exe >nul 2>nul
echo All demo services stopped cleanly.
timeout /t 2 >nul
