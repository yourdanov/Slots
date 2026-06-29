const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    title: "Your Slots",
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    // Prevent white flashing on launch
    show: false,
    backgroundColor: '#072413' // matching vegas Classic panel/bg color
  });

  // Load the compiled index.html
  win.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // Remove menu bar
  win.setMenu(null);

  // Show window once contents are loaded
  win.once('ready-to-show', () => {
    win.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
