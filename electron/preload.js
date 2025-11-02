const { contextBridge, ipcRenderer } = require('electron');

// Exposer les APIs sécurisées au renderer
contextBridge.exposeInMainWorld('electronAPI', {
  checkDependencies: () => ipcRenderer.invoke('check-dependencies'),
  installDependencies: () => ipcRenderer.invoke('install-dependencies'),
  startServices: () => ipcRenderer.invoke('start-services'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Listeners pour les mises à jour
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
  }
});

