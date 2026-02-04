import "./index.css";

type OpenTextFileResult = {
  path: string;
  content: string;
} | null;

type PreloadApi = {
  openTextFile: () => Promise<OpenTextFileResult>;
};

declare global {
  interface Window {
    api: PreloadApi;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const openFileBtn = document.getElementById(
    "openFileBtn",
  ) as HTMLButtonElement | null;
  const filePath = document.getElementById("filePath") as HTMLParagraphElement | null;
  const fileContent = document.getElementById("fileContent") as HTMLPreElement | null;

  if (!openFileBtn || !filePath || !fileContent) return;

  openFileBtn.addEventListener("click", async () => {
    const res = await window.api.openTextFile();

    if (!res) {
      filePath.textContent = "No file selected";
      fileContent.textContent = "";
      return;
    }

    filePath.textContent = res.path;
    fileContent.textContent = res.content;
  });
});
