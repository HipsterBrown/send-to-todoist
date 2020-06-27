const browser = require("webextension-polyfill");

const apiKeyInput = document.querySelector("#apiKey");
const apiKeyStatus = document.querySelector("#apiKey-status");
const apiKeyToggle = document.querySelector("#apiKey-toggle");

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
  } else {
    browser.runtime.sendMessage({
      status: "API_KEY_REQUIRED"
    });
  }

  setTimeout(() => {
    apiKeyStatus.textContent = "";
    apiKeyStatus.classList.remove("text-green-500");
  }, 2000);
});

document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await browser.storage.local.get("apiKey");
  if (apiKey) {
    apiKeyInput.setAttribute("value", apiKey);
  } else {
    apiKeyInput.focus();
    apiKeyStatus.classList.add("text-gray-700");
    apiKeyStatus.textContent =
      "Find your Personal API token under Todoist Settings > Integrations";
  }
});
