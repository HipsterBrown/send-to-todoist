const browser = require("webextension-polyfill");

const apiKeyInput = document.querySelector("#apiKey");
const apiKeyStatus = document.querySelector("#apiKey-status");

apiKeyInput.addEventListener("input", async ({ target }) => {
  await browser.storage.local.set({ apiKey: target.value });
  apiKeyStatus.textContent = "API Key saved!";

  setTimeout(() => {
    apiKeyStatus.textContent = "";
  }, 2000);
});

document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await browser.storage.local.get("apiKey");
  apiKeyInput.setAttribute("value", apiKey);
});
