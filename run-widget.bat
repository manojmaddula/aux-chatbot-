@echo off
echo Starting Contact Center Auxiliary Chatbot Widget Server...
start /b node server.js

timeout /t 2 /nobreak >nul

echo Launching Desktop Chatbot Widget...
REM Attempt to launch in Microsoft Edge App Mode (Dedicated frameless desktop widget window)
start msedge.exe --app="http://localhost:4000/widget.html" --window-size=440,780 --window-position=1460,160

if %ERRORLEVEL% NEQ 0 (
    REM Fallback to Chrome App Mode or default browser
    start chrome.exe --app="http://localhost:4000/widget.html" --window-size=440,780
    if %ERRORLEVEL% NEQ 0 (
        start http://localhost:4000/widget.html
    )
)

echo Chatbot Widget is running!
