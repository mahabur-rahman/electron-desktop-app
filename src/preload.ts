import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  ping: (name: string) => ipcRenderer.invoke("ping", name),
});

export type PreloadApi = {
  ping: (name: string) => Promise<string>;
};
