import "./index.css";

type NoteData = {
  text: string;
  updatedAtIso: string;
};

type PreloadApi = {
  openExternal: (url: string) => Promise<boolean>;
  saveNote: (text: string) => Promise<boolean>;
  loadNote: () => Promise<NoteData | null>;
};

declare global {
  interface Window {
    api: PreloadApi;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("urlInput") as HTMLInputElement | null;
  const openUrlBtn = document.getElementById("openUrlBtn") as HTMLButtonElement | null;
  const openUrlResult = document.getElementById(
    "openUrlResult",
  ) as HTMLParagraphElement | null;

  const noteText = document.getElementById("noteText") as HTMLTextAreaElement | null;
  const saveNoteBtn = document.getElementById(
    "saveNoteBtn",
  ) as HTMLButtonElement | null;
  const loadNoteBtn = document.getElementById(
    "loadNoteBtn",
  ) as HTMLButtonElement | null;
  const clearNoteBtn = document.getElementById(
    "clearNoteBtn",
  ) as HTMLButtonElement | null;
  const noteStatus = document.getElementById("noteStatus") as HTMLParagraphElement | null;

  if (
    !urlInput ||
    !openUrlBtn ||
    !openUrlResult ||
    !noteText ||
    !saveNoteBtn ||
    !loadNoteBtn ||
    !clearNoteBtn ||
    !noteStatus
  ) {
    return;
  }

  openUrlBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    const ok = await window.api.openExternal(url);
    openUrlResult.textContent = ok
      ? "Opened in your default browser."
      : "Blocked/failed (only http/https allowed).";
  });

  saveNoteBtn.addEventListener("click", async () => {
    noteStatus.textContent = "Saving...";
    const ok = await window.api.saveNote(noteText.value);
    noteStatus.textContent = ok ? "Saved." : "Save failed.";
  });

  loadNoteBtn.addEventListener("click", async () => {
    noteStatus.textContent = "Loading...";
    const data = await window.api.loadNote();
    if (!data) {
      noteStatus.textContent = "No saved note yet.";
      return;
    }

    noteText.value = data.text;
    noteStatus.textContent = `Loaded. Updated: ${data.updatedAtIso}`;
  });

  clearNoteBtn.addEventListener("click", () => {
    noteText.value = "";
    noteStatus.textContent = "Cleared (not saved).";
  });
});
