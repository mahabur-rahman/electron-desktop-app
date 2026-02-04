import { app, BrowserWindow, ipcMain } from "electron";
import isDev from "electron-is-dev";
import squirrelStartup from "electron-squirrel-startup";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (squirrelStartup) {
  app.quit();
}

ipcMain.handle("ping", async (_event, name: string) => {
  return `Hello ${name}! (from Main)`;
});

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (isDev) {
    win.webContents.once("did-finish-load", () => {
      win?.webContents.openDevTools({ mode: "right" });
    });
  }

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
