import { app, BrowserWindow, ipcMain, shell } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import isDev from "electron-is-dev";
import squirrelStartup from "electron-squirrel-startup";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (squirrelStartup) {
  app.quit();
}

function isAllowedExternalUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function safeOpenExternal(raw: string): Promise<boolean> {
  if (!isAllowedExternalUrl(raw)) return false;

  try {
    await shell.openExternal(raw);
    return true;
  } catch {
    return false;
  }
}

async function getNoteFilePath(): Promise<string> {
  await app.whenReady();
  return path.join(app.getPath("userData"), "note.json");
}

ipcMain.handle("shell:openExternal", async (_event, url: string) => {
  return safeOpenExternal(url);
});

ipcMain.handle("note:save", async (_event, text: string) => {
  try {
    const notePath = await getNoteFilePath();
    const data = {
      text,
      updatedAtIso: new Date().toISOString(),
    };
    await writeFile(notePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle("note:load", async () => {
  try {
    const notePath = await getNoteFilePath();
    const raw = await readFile(notePath, "utf8");
    const parsed = JSON.parse(raw) as { text: string; updatedAtIso: string };
    if (typeof parsed.text !== "string" || typeof parsed.updatedAtIso !== "string")
      return null;
    return parsed;
  } catch {
    return null;
  }
});

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    void safeOpenExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    const current = win?.webContents.getURL();
    if (!current) return;

    try {
      const targetOrigin = new URL(url).origin;
      const currentOrigin = new URL(current).origin;

      if (targetOrigin !== currentOrigin) {
        event.preventDefault();
        void safeOpenExternal(url);
      }
    } catch {
      event.preventDefault();
    }
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
