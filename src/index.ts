import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { readFile } from "node:fs/promises";
import isDev from "electron-is-dev";
import squirrelStartup from "electron-squirrel-startup";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (squirrelStartup) {
  app.quit();
}

/**
 * Concept #2: invoke/handle (request/response)
 * Renderer -> preload -> ipcRenderer.invoke("file:openText")
 * Main -> ipcMain.handle("file:openText") -> open dialog -> read file -> return {path, content}
 */
ipcMain.handle("file:openText", async () => {
  const result = await dialog.showOpenDialog({
    title: "Open a text file",
    properties: ["openFile"],
    filters: [{ name: "Text", extensions: ["txt", "md", "log"] }],
  });

  if (result.canceled || result.filePaths.length === 0) return null;

  const path = result.filePaths[0];
  const content = await readFile(path, "utf8");

  return { path, content };
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
