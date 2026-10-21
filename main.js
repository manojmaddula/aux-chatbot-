// main.js - Electron wrapper for the Desktop Chatbot Widget
const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess = null;
let mainWindow = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 440,
    height: 760,
    x: width - 460,
    y: 100,
    resizable: true,
    alwaysOnTop: true, // Floats as a true contact center companion widget!
    title: "AUX WFM Agent Copilot",
    icon: path.join(__dirname, 'src', 'favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:4000/widget.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Start local server if not already running
  serverProcess = spawn('node', ['server.js'], { cwd: __dirname });

  setTimeout(() => {
    createWindow();
  }, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
