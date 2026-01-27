const { app, BrowserWindow,Menu } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
 Menu.setApplicationMenu(null);
  // Points to the built Angular files in the 'dist' folder
const indexPath = path.join(__dirname, 'dist/hms-web/browser/index.html');
console.log("Looking for index at:", indexPath);

win.loadFile(indexPath).catch(err => console.error("Failed to load index:", err));
  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});