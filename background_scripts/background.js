const browser = require("webextension-polyfill");

browser.menus.create({
  contexts: ["selection", "link"],
  id: "send-to-todoist",
  title: "Send to Todist"
});

browser.menus.onClicked.addListener(async event => {
  const key = await getApiKey();
  let content = event.selectionText || event.linkText;

  if (content) {
    const response = await fetch("https://api.todoist.com/rest/v1/tasks", {
      method: "post",
      body: JSON.stringify({
        content
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`
      }
    });
    const data = await response.json();
    if (data.url) {
      await browser.notifications.create("newTask", {
        type: "basic",
        title: "New task created!",
        message: data.url
      });
    }
  }
});

browser.notifications.onClicked.addListener(async id => {
  if (id === "newTask") {
    const { newTask } = await browser.notifications.getAll();
    await browser.tabs.create({ active: false, url: newTask.message });
  }
});

async function getApiKey() {
  const { apiKey } = await browser.storage.local.get("apiKey");
  return apiKey;
}
