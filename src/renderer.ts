import "./index.css";

type PreloadApi = {
  ping: (name: string) => Promise<string>;
};

declare global {
  interface Window {
    api: PreloadApi;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("pingBtn") as HTMLButtonElement | null;
  const result = document.getElementById(
    "result",
  ) as HTMLParagraphElement | null;

  if (!btn || !result) return;

  btn.addEventListener("click", async () => {
    const msg = await window.api.ping("Bangla User");
    result.textContent = msg;
  });
});
