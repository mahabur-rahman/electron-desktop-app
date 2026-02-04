import { app, BrowserWindow, ipcMain } from "electron";
import isDev from "electron-is-dev";
import squirrelStartup from "electron-squirrel-startup";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (squirrelStartup) {
  app.quit();
}

let win: BrowserWindow | null = null;

type TaskState = {
  timer: NodeJS.Timeout;
};

const tasksBySenderId = new Map<number, TaskState>();

ipcMain.handle("task:start", async (event) => {
  const senderId = event.sender.id;
  if (tasksBySenderId.has(senderId)) return false;

  let percent = 0;
  const tick = () => {
    percent += 5;
    const status = percent >= 100 ? "Finishing..." : "Downloading...";
    event.sender.send("task:progress", { percent: Math.min(percent, 100), status });

    if (percent >= 100) {
      clearInterval(timer);
      tasksBySenderId.delete(senderId);
      event.sender.send("task:done", { status: "done" });
    }
  };

  const timer = setInterval(tick, 250);
  tasksBySenderId.set(senderId, { timer });
  event.sender.on("destroyed", () => {
    const t = tasksBySenderId.get(senderId);
    if (!t) return;
    clearInterval(t.timer);
    tasksBySenderId.delete(senderId);
  });

  tick();
  return true;
});

ipcMain.handle("task:cancel", async (event) => {
  const senderId = event.sender.id;
  const t = tasksBySenderId.get(senderId);
  if (!t) return false;
  clearInterval(t.timer);
  tasksBySenderId.delete(senderId);
  event.sender.send("task:done", { status: "canceled" });
  return true;
});

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 500,
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
