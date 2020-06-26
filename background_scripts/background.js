const browser = require("webextension-polyfill");

async function main() {
  const projects = await getProjects();

  for (const { id, name } of projects) {
    browser.menus.create({
      contexts: ["selection", "link"],
      id: String(id),
      title: name
    });
  }
}

main();

browser.menus.onClicked.addListener(async event => {
  const key = await getApiKey();
  let content = event.selectionText || event.linkText;

  if (event.linkUrl) {
    content += ` ${event.linkUrl}`;
  }

  if (content) {
    const projects = await getProjects();
    const { id: projectId } =
      projects.find(({ id }) => id === parseInt(event.menuItemId)) || {};

    const response = await fetch("https://api.todoist.com/rest/v1/tasks", {
      method: "post",
      body: JSON.stringify({
        content,
        project_id: projectId
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

async function getProjects() {
  const key = await getApiKey();
  const response = await fetch("https://api.todoist.com/rest/v1/projects", {
    headers: { Authorization: `Bearer ${key}` }
  });
  return response.json();
}
