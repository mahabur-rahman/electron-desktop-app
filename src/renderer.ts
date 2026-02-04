import "./index.css";

type PreloadApi = {
  startTask: () => Promise<boolean>;
  cancelTask: () => Promise<boolean>;
  onTaskProgress: (cb: (p: { percent: number; status: string }) => void) => () => void;
  onTaskDone: (cb: (p: { status: "done" | "canceled" }) => void) => () => void;
};

declare global {
  interface Window {
    api: PreloadApi;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn") as HTMLButtonElement | null;
  const cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement | null;
  const progressBar = document.getElementById(
    "progressBar",
  ) as HTMLProgressElement | null;
  const progressText = document.getElementById(
    "progressText",
  ) as HTMLSpanElement | null;
  const statusText = document.getElementById(
    "statusText",
  ) as HTMLParagraphElement | null;

  if (!startBtn || !cancelBtn || !progressBar || !progressText || !statusText) return;

  const setProgress = (percent: number) => {
    const safe = Math.max(0, Math.min(100, Math.round(percent)));
    progressBar.value = safe;
    progressText.textContent = `${safe}%`;
  };

  setProgress(0);

  let unsubscribeProgress: (() => void) | null = null;
  let unsubscribeDone: (() => void) | null = null;

  const ensureSubscriptions = () => {
    if (!unsubscribeProgress) {
      unsubscribeProgress = window.api.onTaskProgress((p) => {
        setProgress(p.percent);
        statusText.textContent = p.status;
      });
    }
    if (!unsubscribeDone) {
      unsubscribeDone = window.api.onTaskDone((p) => {
        statusText.textContent = p.status === "done" ? "Done!" : "Canceled.";
      });
    }
  };

  startBtn.addEventListener("click", async () => {
    ensureSubscriptions();
    statusText.textContent = "Starting...";
    const ok = await window.api.startTask();
    if (!ok) statusText.textContent = "Already running.";
  });

  cancelBtn.addEventListener("click", async () => {
    statusText.textContent = "Canceling...";
    const ok = await window.api.cancelTask();
    if (!ok) statusText.textContent = "Nothing to cancel.";
  });
});
