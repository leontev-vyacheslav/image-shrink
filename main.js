const path = require('path');
const os = require('os');
const { app, BrowserWindow, globalShortcut, ipcMain, shell } = require('electron');

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const log = require('electron-log');

process.env.NODE_ENV = 'development';
const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'derwin';
const isWin = process.platform === 'win32';

let mainWindow = null;

const createMainWindow = () => {
  try {
    mainWindow = new BrowserWindow({
      title: 'ImageShrink',
      width: 700,
      height: 600,
      icon: `${__dirname}/assets/icons/Icon_32x32.png`,
      resizable: false,
      frame: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
    mainWindow.loadURL(`file://${__dirname}/app/mainWindow.html`);
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
  } catch (error) {
    log.error(error);
  }
};

const shrinkImage = async ({ path, quality, dest }) => {
  const pngQuality = quality / 100;
  let files = null;
  try {
    files = await imagemin([slash(path)], {
      destination: dest,
      plugins: [imageminMozjpeg({ quality: quality }), imageminPngquant({ quality: [pngQuality, pngQuality] })],
    });

    log.info(files);

    mainWindow.webContents.send('image:done');
  } catch (error) {
    log.error(error);
  }
  shell.openPath(dest);
};

ipcMain.on('image:minimize', async (e, args) => {
  args.dest = path.join(os.homedir(), 'image-shrink');
  await shrinkImage(args);
});

app.whenReady().then(() => {
  log.info('App path:', `file://${__dirname}/app/mainWindow.html`);

  globalShortcut.register('CmdOrCtrl+R', () => {
    mainWindow.reload();
  });

  globalShortcut.register(isWin ? 'Ctrl+Shift+I' : 'Command+Alt+I', () => {
    mainWindow.toggleDevTools();
  });

  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
