import { contextBridge, ipcRenderer } from "electron";

export type NoteData = {
  text: string;
  updatedAtIso: string;
};

export type PreloadApi = {
  openExternal: (url: string) => Promise<boolean>;
  saveNote: (text: string) => Promise<boolean>;
  loadNote: () => Promise<NoteData | null>;
};

const api: PreloadApi = {
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
  saveNote: (text) => ipcRenderer.invoke("note:save", text),
  loadNote: () => ipcRenderer.invoke("note:load"),
};

contextBridge.exposeInMainWorld("api", api);
