// main.js - Electron wrapper for the Desktop Chatbot Widget
const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Ensure Windows taskbar correctly groups and displays custom Panda icon
if (process.platform === 'win32') {
  app.setAppUserModelId('com.nicexone.auxcopilot.panda');
}

let serverProcess = null;
let mainWindow = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const iconPath = path.join(__dirname, 'src', 'favicon.ico');

  mainWindow = new BrowserWindow({
    width: 440,
    height: 760,
    x: width - 460,
    y: 100,
    resizable: true,
    alwaysOnTop: true, // Floats as a true contact center companion widget!
    title: "AUX WFM Agent Copilot",
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setIcon(iconPath);

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
