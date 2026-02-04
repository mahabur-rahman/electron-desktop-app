import "./index.css";

type PreloadApi = {
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

declare global {
  interface Window {
    api: PreloadApi;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const refreshInfoBtn = document.getElementById(
    "refreshInfoBtn",
  ) as HTMLButtonElement | null;
  const appInfo = document.getElementById("appInfo") as HTMLPreElement | null;

  const minimizeBtn = document.getElementById(
    "minimizeBtn",
  ) as HTMLButtonElement | null;
  const toggleMaxBtn = document.getElementById(
    "toggleMaxBtn",
  ) as HTMLButtonElement | null;
  const closeBtn = document.getElementById("closeBtn") as HTMLButtonElement | null;
  const winStatus = document.getElementById("winStatus") as HTMLParagraphElement | null;

  if (
    !refreshInfoBtn ||
    !appInfo ||
    !minimizeBtn ||
    !toggleMaxBtn ||
    !closeBtn ||
    !winStatus
  ) {
    return;
  }

  const refreshInfo = async () => {
    appInfo.textContent = "Loading...";
    try {
      const info = await window.api.getAppInfo();
      appInfo.textContent = JSON.stringify(info, null, 2);
    } catch {
      appInfo.textContent = "Failed to load app info. Restart `npm run start`.";
    }
  };

  refreshInfoBtn.addEventListener("click", () => void refreshInfo());

  minimizeBtn.addEventListener("click", async () => {
    winStatus.textContent = "Minimizing...";
    try {
      await window.api.minimizeWindow();
      winStatus.textContent = "Minimized.";
    } catch {
      winStatus.textContent = "Failed to minimize.";
    }
  });

  toggleMaxBtn.addEventListener("click", async () => {
    winStatus.textContent = "Toggling...";
    try {
      const isMax = await window.api.toggleMaximizeWindow();
      winStatus.textContent = isMax ? "Maximized." : "Unmaximized.";
    } catch {
      winStatus.textContent = "Failed to toggle maximize.";
    }
  });

  closeBtn.addEventListener("click", async () => {
    winStatus.textContent = "Closing...";
    try {
      await window.api.closeWindow();
    } catch {
      winStatus.textContent = "Failed to close.";
    }
  });

  void refreshInfo();
});
