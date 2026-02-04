import { contextBridge, ipcRenderer } from "electron";

export type OpenTextFileResult = {
  path: string;
  content: string;
} | null;

export type PreloadApi = {
  openTextFile: () => Promise<OpenTextFileResult>;
};

const api: PreloadApi = {
  openTextFile: () => ipcRenderer.invoke("file:openText"),
};

contextBridge.exposeInMainWorld("api", api);
