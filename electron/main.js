const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { autoUpdater } = require('electron-updater');

// Configuration
const BACKEND_PORT = 4000;
const FRONTEND_PORT = 3000;
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;
let frontendProcess;
let installWindow;

// Fonction pour vérifier si Node.js est installé
async function checkNodeJS() {
  return new Promise((resolve) => {
    exec('node --version', (error) => {
      resolve(!error);
    });
  });
}

// Fonction pour vérifier si Docker est installé
async function checkDocker() {
  return new Promise((resolve) => {
    exec('docker --version', (error) => {
      resolve(!error);
    });
  });
}

// Fonction pour démarrer le backend
async function startBackend() {
  const backendPath = path.join(__dirname, '..');
  
  return new Promise((resolve, reject) => {
    const isProduction = !isDev && fs.existsSync(path.join(backendPath, 'dist'));
    
    if (isProduction) {
      // Mode production - utiliser le build compilé
      backendProcess = spawn('node', ['dist/server.js'], {
        cwd: backendPath,
        env: { ...process.env, NODE_ENV: 'production', PORT: BACKEND_PORT }
      });
    } else {
      // Mode développement
      backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: backendPath,
        shell: true,
        env: { ...process.env, PORT: BACKEND_PORT }
      });
    }

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Backend]', output);
      
      // Vérifier si le serveur est prêt
      if (output.includes('Server running') || output.includes('listening')) {
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error('[Backend Error]', data.toString());
    });

    backendProcess.on('error', (error) => {
      console.error('Erreur démarrage backend:', error);
      reject(error);
    });

    // Timeout de sécurité
    setTimeout(() => {
      resolve(); // On assume que c'est bon après 5 secondes
    }, 5000);
  });
}

// Fonction pour démarrer le frontend
async function startFrontend() {
  const frontendPath = path.join(__dirname, '..', 'frontend');
  
  return new Promise((resolve, reject) => {
    const isProduction = !isDev && fs.existsSync(path.join(frontendPath, '.next'));
    
    if (isProduction) {
      // Mode production
      frontendProcess = spawn('npm', ['start'], {
        cwd: frontendPath,
        shell: true,
        env: { ...process.env, NODE_ENV: 'production', PORT: FRONTEND_PORT }
      });
    } else {
      // Mode développement
      frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: frontendPath,
        shell: true,
        env: { ...process.env, PORT: FRONTEND_PORT }
      });
    }

    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Frontend]', output);
      
      if (output.includes('Ready') || output.includes('Local:')) {
        resolve();
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      console.error('[Frontend Error]', data.toString());
    });

    frontendProcess.on('error', (error) => {
      console.error('Erreur démarrage frontend:', error);
      reject(error);
    });

    // Timeout de sécurité
    setTimeout(() => {
      resolve();
    }, 5000);
  });
}

// Créer la fenêtre principale
function createWindow() {
  const iconPath = process.platform === 'win32' 
    ? path.join(__dirname, '..', 'build', 'icon.ico')
    : path.join(__dirname, '..', 'build', 'icon.png');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    show: false, // Ne pas afficher jusqu'à ce que le frontend soit prêt
    frame: true,
    titleBarStyle: 'default'
  });

  // Charger le frontend
  const frontendUrl = isDev 
    ? `http://localhost:${FRONTEND_PORT}`
    : `http://localhost:${FRONTEND_PORT}`;

  mainWindow.loadURL(frontendUrl);

  // Afficher la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus sur la fenêtre
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Créer la fenêtre d'installation
function createInstallWindow() {
  installWindow = new BrowserWindow({
    width: 600,
    height: 400,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  installWindow.loadFile(path.join(__dirname, 'installer.html'));
  
  return installWindow;
}

// IPC Handlers
ipcMain.handle('check-dependencies', async () => {
  const hasNode = await checkNodeJS();
  const hasDocker = await checkDocker();
  
  return {
    nodejs: hasNode,
    docker: hasDocker,
    allInstalled: hasNode && hasDocker
  };
});

ipcMain.handle('install-dependencies', async () => {
  const installWindow = createInstallWindow();
  
  // Ici, vous pourriez installer automatiquement Node.js et Docker
  // Pour l'instant, on guide juste l'utilisateur
  // TODO: Implémenter l'installation automatique
  
  return { success: true };
});

ipcMain.handle('start-services', async () => {
  try {
    // Démarrer le backend
    await startBackend();
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Démarrer le frontend
    await startFrontend();
    
    return { success: true };
  } catch (error) {
    console.error('Erreur démarrage services:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Configuration auto-updater pour GitHub Releases
if (!isDev) {
  // Configurer autoUpdater pour GitHub
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'OliverThys',
    repo: 'EasyRecruit',
  });

  // Vérifier les mises à jour au démarrage
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('checking-for-update', () => {
    console.log('Vérification des mises à jour...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Mise à jour disponible:', info.version);
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Mise à jour disponible',
        message: `Une nouvelle version (${info.version}) est disponible. Elle sera téléchargée en arrière-plan.`,
        buttons: ['OK']
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Aucune mise à jour disponible');
  });

  autoUpdater.on('error', (err) => {
    console.error('Erreur auto-updater:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = `Téléchargement: ${progressObj.percent.toFixed(2)}%`;
    log_message += ` (${progressObj.transferred}/${progressObj.total})`;
    console.log(log_message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Mise à jour téléchargée:', info.version);
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Mise à jour prête',
        message: `La mise à jour (${info.version}) est téléchargée. L'application va redémarrer pour l'installer.`,
        buttons: ['Redémarrer maintenant', 'Plus tard']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    } else {
      // Si la fenêtre n'est pas encore créée, installer immédiatement
      autoUpdater.quitAndInstall();
    }
  });

  // Vérifier les mises à jour toutes les 4 heures
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 4 * 60 * 60 * 1000);
}

// Fonction pour afficher les dépendances manquantes avec liens
async function showMissingDependencies() {
  const missing = [];
  
  const hasNode = await checkNodeJS();
  if (!hasNode) {
    missing.push({
      name: 'Node.js',
      url: 'https://nodejs.org/',
      description: 'Node.js 18+ est requis pour exécuter EasyRecruit'
    });
  }
  
  const hasDocker = await checkDocker();
  if (!hasDocker) {
    missing.push({
      name: 'Docker Desktop',
      url: 'https://www.docker.com/products/docker-desktop',
      description: 'Docker Desktop est requis pour la base de données'
    });
  }
  
  if (missing.length > 0) {
    const message = missing.map(dep => 
      `• ${dep.name}: ${dep.description}`
    ).join('\n\n');
    
    const result = await dialog.showMessageBox({
      type: 'warning',
      title: 'Dépendances manquantes',
      message: `Les dépendances suivantes ne sont pas installées :\n\n${message}\n\nSouhaitez-vous ouvrir les pages de téléchargement ?`,
      buttons: ['Ouvrir les téléchargements', 'Annuler'],
      defaultId: 0,
      cancelId: 1
    });
    
    if (result.response === 0) {
      // Ouvrir tous les liens de téléchargement
      missing.forEach(dep => {
        require('electron').shell.openExternal(dep.url);
      });
    }
    
    app.quit();
    return true;
  }
  
  return false;
}

// App lifecycle
app.whenReady().then(async () => {
  // Vérifier et afficher les dépendances manquantes
  const hasMissing = await showMissingDependencies();
  if (hasMissing) {
    return;
  }

  // Démarrer les services
  try {
    await startBackend();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await startFrontend();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Créer la fenêtre principale
    createWindow();
  } catch (error) {
    dialog.showErrorBox('Erreur', `Impossible de démarrer l'application: ${error.message}`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Arrêter les processus
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendProcess) {
    frontendProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // Arrêter proprement les processus
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendProcess) {
    frontendProcess.kill();
  }
});

