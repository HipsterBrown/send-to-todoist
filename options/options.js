const { browser } = require("webextension-polyfill-ts");

const IS_CHROME = typeof browser.menus === "undefined";

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

const shortcutFieldTemplate = document.querySelector("#shortcut-field");
const shortcutFieldsSection = document.querySelector("#shortcut-fields");

const shortcutFlash = document.querySelector("#shortcut-flash");
const shortcutFlashMessage = document.querySelector("#shortcut-flash--message");
const shortcutFlashIcon = document.querySelector("#shortcut-flash--icon");

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
  messageBar.classList.add("block", "bg-green-300");

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

async function updateCommand({ target }) {
  try {
    await browser.commands.update({
      name: target.name,
      shortcut: target.value
    });

    shortcutFlash.classList.remove("hidden");

    setTimeout(() => {
      shortcutFlash.classList.add("hidden");
    }, 2000);
  } catch (error) {
    alert(error.message);
  }
}

browser.commands
  .getAll()
  .then(commands => {
    shortcutFieldsSection.innerHTML = "";

    shortcutFlashIcon.src = INFO_ICON;
    if (IS_CHROME) {
      shortcutFlashMessage.innerHTML = `Shortcuts can only be edited at <a class="text-blue-500" href="chrome://extensions/shortcuts">chrome://extensions/shortcuts</a>`;
    } else {
      shortcutFlashMessage.innerHTML = `Shortcuts can only be edited at <pre class="inline max-w-max">about:addons</pre>, see <a class="text-blue-500"  href="https://bug1303384.bmoattachments.org/attachment.cgi?id=9051647" target="_blank">the following tutorial</a>`;
    }
    shortcutFlash.classList.replace("bg-green-300", "bg-gray-200");
    shortcutFlash.classList.remove("hidden");

    commands.forEach(command => {
      const field = shortcutFieldTemplate.content.cloneNode(true);
      const label = field.querySelector("label");
      const input = field.querySelector("input");

      label.htmlFor = command.name;
      label.id = `${command.name}-label`;
      label.textContent =
        command.description ||
        command.name
          .split("_")
          .filter(Boolean)
          .map((word, index) =>
            index ? word : word.slice(0, 1).toUpperCase() + word.slice(1)
          )
          .join(" ");

      input.name = command.name;
      input.id = command.name;
      input.setAttribute("aria-labelledby", label.id);
      input.value = command.shortcut;
      input.disabled = true;

      /**
       * TODO: create custom element for editing keyboard shortcut
       * - maintains state of input using FSM
       * - validates allowed keys
       * - outputs symbols for each key, based on OS
       */

      shortcutFieldsSection.appendChild(field);
    });
  })
  .catch(console.error);

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
    messageBar.classList.remove("hidden", "bg-green-300");
    messageBar.classList.add("block", "bg-gray-200");

    syncButton.setAttribute("disabled", true);
    syncButton.classList.remove("bg-white", "hover:bg-gray-50");
    syncButton.classList.add("cursor-not-allowed", "bg-gray-300");
  }
});
