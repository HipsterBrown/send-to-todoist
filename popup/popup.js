import '../options/sync-it.js'

const INFO_ICON = "../../../icons/info.svg";

const syncButton = document.querySelector("sync-it");

const settingsButton = document.querySelector("#settings");
const settingsMessage = settingsButton.querySelector("#settings-message");
const settingsIcon = settingsButton.querySelector("#settings-icon");

syncButton.addEventListener("click", async () => {
  const { apiKey } = await browser.storage.local.get("apiKey");
  if (apiKey) {
    syncButton.setStatus("syncing")
    await browser.runtime.sendMessage({
      status: "SYNC_PROJECTS"
    });
    syncButton.setStatus("complete")

    setTimeout(() => {
      syncButton.setStatus("pending")
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
