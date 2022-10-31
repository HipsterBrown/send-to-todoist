import { browser } from 'webextension-polyfill-ts';

const CHECK_ICON = "../../../icons/check.svg";
const INFO_ICON = "../../../icons/info.svg";
const SYNC_ICON = "../../../icons/sync.svg";
const SETTINGS_ICON = "../../../icons/settings.svg";

const syncButton = document.querySelector("#sync");
const syncMessage = document.querySelector("#sync-message");
const syncIcon = document.querySelector("#sync-icon");

const settingsButton = document.querySelector("#settings");
const settingsMessage = document.querySelector("#settings-message");
const settingsIcon = document.querySelector("#settings-icon");

syncButton.addEventListener("click", async () => {
  const { apiKey } = await browser.storage.local.get("apiKey");
  if (apiKey) {
    syncIcon.classList.add("animate-spin");
    syncMessage.textContent = "Syncing...";
    await browser.runtime.sendMessage({
      status: "SYNC_PROJECTS"
    });
    syncIcon.classList.remove("animate-spin");
    syncIcon.src = CHECK_ICON;
    syncMessage.textContent = "Sync complete!";

    setTimeout(() => {
      syncIcon.src = SYNC_ICON;
      syncMessage.textContent = "Sync";
    }, 2000);
  }
});

settingsButton.addEventListener("click", () => {
  browser.runtime.openOptionsPage();
});

document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await browser.storage.local.get("apiKey");
  if (!apiKey) {
    document.body.style = "min-width: 200px";
    syncButton.classList.add("hidden");
    settingsIcon.src = INFO_ICON;
    settingsMessage.textContent = "Configure extension";
  }
});
