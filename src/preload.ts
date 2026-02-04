import { contextBridge, ipcRenderer } from "electron";

export type PreloadApi = {
  startTask: () => Promise<boolean>;
  cancelTask: () => Promise<boolean>;
  onTaskProgress: (cb: (p: { percent: number; status: string }) => void) => () => void;
  onTaskDone: (cb: (p: { status: "done" | "canceled" }) => void) => () => void;
};

const api: PreloadApi = {
  startTask: () => ipcRenderer.invoke("task:start"),
  cancelTask: () => ipcRenderer.invoke("task:cancel"),
  onTaskProgress: (cb) => {
    const listener = (_event: unknown, payload: { percent: number; status: string }) =>
      cb(payload);
    ipcRenderer.on("task:progress", listener);
    return () => ipcRenderer.removeListener("task:progress", listener);
  },
  onTaskDone: (cb) => {
    const listener = (_event: unknown, payload: { status: "done" | "canceled" }) =>
      cb(payload);
    ipcRenderer.on("task:done", listener);
    return () => ipcRenderer.removeListener("task:done", listener);
  },
};

contextBridge.exposeInMainWorld("api", api);
