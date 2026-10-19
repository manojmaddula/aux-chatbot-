// preload.js - expose safe IPC bridge
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  requestBreak: (payload) => ipcRenderer.invoke('request-break', payload),
  fetchArticles: (query) => ipcRenderer.invoke('fetch-articles', query),
  sendAlert: (alert) => ipcRenderer.invoke('send-alert', alert),
  onNotification: (callback) => ipcRenderer.on('notification', (event, data) => callback(data)),
});
