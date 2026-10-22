// main.js - Electron wrapper with Floating Companion Window & System Tray Icon
const { app, BrowserWindow, screen, Tray, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.nicexone.auxcopilot.panda');
}

let serverProcess = null;
let mainWindow = null;
let tray = null;
let isQuitting = false;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const iconPath = path.join(__dirname, 'src', 'favicon.ico');

  mainWindow = new BrowserWindow({
    width: 460,
    height: 760,
    x: width - 480,
    y: Math.max(40, height - 780),
    resizable: true,
    alwaysOnTop: true, // Floats as desktop companion widget over any app!
    title: "NICE CXone ZEL Ask Shankar & AUX Assistant",
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setIcon(iconPath);
  mainWindow.loadURL('http://localhost:4000/widget.html');

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      if (tray && tray.displayBalloon) {
        try {
          tray.displayBalloon({
            title: "ZEL Ask Shankar Minimized",
            content: "Ask Shankar is running in your taskbar hidden icons. Click the Panda icon anytime to restore it!"
          });
        } catch (e) {}
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'src', 'favicon.ico');
  tray = new Tray(iconPath);
  tray.setToolTip('NICE CXone ZEL Ask Shankar & AUX Assistant');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🐼 Show / Hide Ask Shankar Widget',
      click: () => {
        if (!mainWindow) {
          createWindow();
        } else if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: '🤖 Open Agent Bot Workstation',
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL('http://localhost:4000/agent-home.html');
          mainWindow.setSize(1200, 800);
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: '💬 Open Ask Shankar & ACW Assistant',
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL('http://localhost:4000/widget.html');
          mainWindow.setSize(460, 760);
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: '☕ Open AUX Break Portal',
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL('http://localhost:4000/portal.html');
          mainWindow.setSize(920, 800);
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: '🛡️ Open Supervisor Command Center',
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL('http://localhost:4000/supervisor.html');
          mainWindow.setSize(1280, 860);
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: '✕ Exit Application',
      click: () => {
        isQuitting = true;
        if (mainWindow) mainWindow.destroy();
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (!mainWindow) {
      createWindow();
    } else if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  serverProcess = spawn('node', ['server.js'], { cwd: __dirname });

  setTimeout(() => {
    createWindow();
    createTray();
  }, 1000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) {
    if (serverProcess) serverProcess.kill();
    app.quit();
  }
});
