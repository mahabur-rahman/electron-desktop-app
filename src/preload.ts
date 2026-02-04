import { contextBridge, ipcRenderer } from "electron";

export type PreloadApi = {
  getAppInfo: () => Promise<{
    name: string;
    version: string;
    platform: string;
    arch: string;
  }>;
  minimizeWindow: () => Promise<void>;
  toggleMaximizeWindow: () => Promise<boolean>;
  closeWindow: () => Promise<void>;
};

const api: PreloadApi = {
  getAppInfo: () => ipcRenderer.invoke("app:getInfo"),
  minimizeWindow: () => ipcRenderer.invoke("win:minimize"),
  toggleMaximizeWindow: () => ipcRenderer.invoke("win:toggleMaximize"),
  closeWindow: () => ipcRenderer.invoke("win:close"),
};

contextBridge.exposeInMainWorld("api", api);
