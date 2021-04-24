const { browser } = require("webextension-polyfill-ts");

const CHECK_ICON = "../../../icons/check.svg";
const INFO_ICON = "../../../icons/info.svg";
const SYNC_ICON = "../../../icons/sync.svg";

const apiKeyInput = document.querySelector("#apiKey");
const apiKeyToggle = document.querySelector("#apiKey-toggle");
const syncButton = document.querySelector("#sync");
const syncMessage = document.querySelector("#sync-message");
const syncIcon = document.querySelector("#sync-icon");
const messageBar = document.querySelector("#message-bar");
const messageBarMessage = document.querySelector("#message-bar--message");
const messageBarIcon = document.querySelector("#message-bar--icon");

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
  messageBarMessage.textContent = "API Key saved!";
  messageBarIcon.src = CHECK_ICON;
  messageBar.classList.remove("hidden", "bg-gray-200");
  messageBar.classList.add("block", "bg-green-400");

  if (target.value) {
    browser.runtime.sendMessage({
      status: "API_KEY_SET"
    });
    syncButton.removeAttribute("disabled");
    syncButton.classList.remove("cursor-not-allowed", "bg-gray-300");
    syncButton.classList.add("bg-white", "hover:bg-gray-50");
  } else {
    browser.runtime.sendMessage({
      status: "API_KEY_REQUIRED"
    });
    syncButton.setAttribute("disabled", true);
    syncButton.classList.remove("bg-white", "hover:bg-gray-50");
    syncButton.classList.add("cursor-not-allowed", "bg-gray-300");
  }

  setTimeout(() => {
    messageBar.classList.remove("block");
    messageBar.classList.add("hidden");
  }, 2000);
});

syncMessage.addEventListener("click", async () => {
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

document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await browser.storage.local.get("apiKey");
  if (apiKey) {
    apiKeyInput.setAttribute("value", apiKey);
    syncButton.removeAttribute("disabled");
    syncButton.classList.remove("cursor-not-allowed");
  } else {
    apiKeyInput.focus();
    messageBarIcon.src = INFO_ICON;
    messageBarMessage.textContent =
      "Find your Personal API token under Todoist Settings > Integrations";
    messageBar.classList.remove("hidden", "bg-green-400");
    messageBar.classList.add("block", "bg-gray-200");

    syncButton.setAttribute("disabled", true);
    syncButton.classList.remove("bg-white", "hover:bg-gray-50");
    syncButton.classList.add("cursor-not-allowed", "bg-gray-300");
  }
});
