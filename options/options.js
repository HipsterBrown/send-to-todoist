import './flash-message.js';
import './sync-it.js';
import './shortcut-field.js';

const IS_CHROME = typeof browser.menus === "undefined";

const apiKeyInput = document.querySelector("#apiKey");
const apiKeyToggle = document.querySelector("#apiKey-toggle");
const projectShortcutSelect = document.querySelector("#shortcutProject")

const syncButton = document.querySelector("sync-it");
const messageBar = document.querySelector("#message-bar");
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
    syncButton.enable()
  } else {
    browser.runtime.sendMessage({
      status: "API_KEY_REQUIRED"
    });
    syncButton.disable()
  }

  setTimeout(() => {
    messageBar.hide();
  }, 2000);
});

syncButton.addEventListener("click", async () => {
  const { apiKey } = await browser.storage.local.get("apiKey");
  if (apiKey) {
    syncButton.setStatus("syncing")

    await browser.runtime.sendMessage({
      status: "SYNC_PROJECTS"
    });
    await syncProjectsForShortcut(apiKey)
    syncButton.setStatus("complete")

    setTimeout(() => {
      syncButton.setStatus("pending")
    }, 2000);
  }
});

async function getProjects(key) {
  const response = await fetch("https://api.todoist.com/rest/v2/projects", {
    headers: { Authorization: `Bearer ${key}` },
  });
  return response.json();
}

async function syncProjectsForShortcut(apiKey) {
  const projects = await getProjects(apiKey);
  const { shortcutProject } = await browser.storage.local.get("shortcutProject");
  const projectOptions = projects.map(({ id, name }) => {
    if (shortcutProject === id) {
      return `<option value="${id}" selected>${name}</option>`
    }
    return `<option value="${id}">${name}</option>`
  });
  projectShortcutSelect.innerHTML = projectOptions.join('');

}

projectShortcutSelect.addEventListener("change", async ({ target }) => {
  await browser.storage.local.set({ shortcutProject: target.value });
  messageBar
    .setMessage("Shortcut Project saved!")
    .setStatus("success")
    .show();

  if (target.value) {
    browser.runtime.sendMessage({
      status: "PROJECT_SHORTCUT_SET"
    });
  }

  setTimeout(() => {
    messageBar.hide();
  }, 2000);
});

browser.commands
  .getAll()
  .then(commands => {
    if (IS_CHROME) {
      shortcutFlash.setMessage(`Shortcuts can only be edited at <a class="text-blue-500" href="chrome://extensions/shortcuts">chrome://extensions/shortcuts</a>`)
    } else {
      shortcutFlash.setMessage(`Shortcuts can only be edited at <pre class="inline max-w-max">about:addons</pre>, see <a class="text-blue-500"  href="https://bug1303384.bmoattachments.org/attachment.cgi?id=9051647" target="_blank">the following tutorial</a>`)
    }
    shortcutFlash.setStatus("info").show();
    shortcutFieldsSection.innerHTML = commands.map(command => (
      `<shortcut-field name="${command.name}" description="${command.description}" shortcut="${command.shortcut}"></shortcut-field>`
    )).join('')
  })
  .catch(console.error);

document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await browser.storage.local.get("apiKey");
  if (apiKey) {
    apiKeyInput.setAttribute("value", apiKey);
    syncButton.enable();
    void syncProjectsForShortcut(apiKey)
  } else {
    apiKeyInput.focus();
    messageBar
      .setMessage("Find your Personal API token under Todoist Settings > Integrations")
      .setStatus("info")
      .show();
    syncButton.disable()
    projectShortcutSelect.setAttribute('disabled')
  }
});
