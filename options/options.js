import './flash-message.js';

const IS_CHROME = typeof browser.menus === "undefined";

const CHECK_ICON = "../../../icons/check.svg";
const SYNC_ICON = "../../../icons/sync.svg";

const apiKeyInput = document.querySelector("#apiKey");
const apiKeyToggle = document.querySelector("#apiKey-toggle");

const syncButton = document.querySelector("#sync");
const syncMessage = document.querySelector("#sync-message");
const syncIcon = document.querySelector("#sync-icon");

const messageBar = document.querySelector("#message-bar");

const shortcutFieldTemplate = document.querySelector("#shortcut-field");
const shortcutFieldsSection = document.querySelector("#shortcut-fields");

const shortcutFlash = document.querySelector("#shortcut-flash");

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
  messageBar
    .setMessage("API Key saved!")
    .setStatus("success")
    .show();

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
    messageBar.hide();
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
    shortcutFlash.show();

    setTimeout(() => {
      shortcutFlash.hide();
    }, 2000);
  } catch (error) {
    alert(error.message);
  }
}

browser.commands
  .getAll()
  .then(commands => {
    shortcutFieldsSection.innerHTML = "";

    if (IS_CHROME) {
      shortcutFlash.setMessage(`Shortcuts can only be edited at <a class="text-blue-500" href="chrome://extensions/shortcuts">chrome://extensions/shortcuts</a>`)
    } else {
      shortcutFlash.setMessage(`Shortcuts can only be edited at <pre class="inline max-w-max">about:addons</pre>, see <a class="text-blue-500"  href="https://bug1303384.bmoattachments.org/attachment.cgi?id=9051647" target="_blank">the following tutorial</a>`)
    }
    shortcutFlash.setStatus("info").show();

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
    messageBar
      .setMessage("Find your Personal API token under Todoist Settings > Integrations")
      .setStatus("info")
      .show();

    syncButton.setAttribute("disabled", true);
    syncButton.classList.remove("bg-white", "hover:bg-gray-50");
    syncButton.classList.add("cursor-not-allowed", "bg-gray-300");
  }
});
