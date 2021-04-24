const { browser } = require("webextension-polyfill-ts");

const apiKeyInput = document.querySelector("#apiKey");
const apiKeyStatus = document.querySelector("#apiKey-status");
const apiKeyToggle = document.querySelector("#apiKey-toggle");
const syncButton = document.querySelector("#sync");

apiKeyToggle.addEventListener("click", () => {
  if (apiKeyToggle.textContent === "Show") {
    apiKeyToggle.textContent = "Hide";
    apiKeyInput.setAttribute("type", "text");
    apiKeyInput.setAttribute("aria-label", "hide API token");
  } else {
    apiKeyToggle.textContent = "Show";
    apiKeyInput.setAttribute("type", "password");
    apiKeyInput.setAttribute("aria-label", "show API token");
  }
});

apiKeyInput.addEventListener("input", async ({ target }) => {
  await browser.storage.local.set({ apiKey: target.value });
  apiKeyStatus.classList.remove("text-gray-700");
  apiKeyStatus.classList.add("text-green-500");
  apiKeyStatus.textContent = "API Key saved!";

  if (target.value) {
    browser.runtime.sendMessage({
      status: "API_KEY_SET"
    });
    syncButton.removeAttribute("disabled");
    syncButton.classList.remove("cursor-not-allowed");
  } else {
    browser.runtime.sendMessage({
      status: "API_KEY_REQUIRED"
    });
    syncButton.setAttribute("disabled", true);
    syncButton.classList.add("cursor-not-allowed");
  }

  setTimeout(() => {
    apiKeyStatus.textContent = "";
    apiKeyStatus.classList.remove("text-green-500");
  }, 2000);
});

syncButton.addEventListener("click", async () => {
  const { apiKey } = await browser.storage.local.get("apiKey");
  if (apiKey) {
    syncButton.textContent = "Syncing...";
    await browser.runtime.sendMessage({
      status: "SYNC_PROJECTS"
    });
    syncButton.textContent = "Sync complete!";

    setTimeout(() => {
      syncButton.textContent = "Sync latest settings";
    }, 2000);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await browser.storage.local.get("apiKey");
  if (apiKey) {
    apiKeyInput.setAttribute("value", apiKey);
    syncButton.removeAttribute("disabled");
    syncButton.classList.remove("cursor-not-allowed");
  } else {
    apiKeyInput.focus();
    apiKeyStatus.classList.add("text-gray-700");
    apiKeyStatus.textContent =
      "Find your Personal API token under Todoist Settings > Integrations";

    syncButton.setAttribute("disabled", true);
    syncButton.classList.add("cursor-not-allowed");
  }
});
