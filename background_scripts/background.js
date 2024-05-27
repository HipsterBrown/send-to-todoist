const IS_CHROME = typeof browser.menus === "undefined";

if (IS_CHROME) {
  browser.menus = chrome.contextMenus;
}

async function getApiKey() {
  const { apiKey } = await browser.storage.local.get("apiKey");
  return apiKey;
}

async function getProjects() {
  const key = await getApiKey();
  const response = await fetch("https://api.todoist.com/rest/v2/projects", {
    headers: { Authorization: `Bearer ${key}` },
  });
  return response.json();
}

const DUE_STRINGS = Object.freeze(["Today", "Tomorrow", "Next week"]);

async function setProjectMenus() {
  const contexts = ["selection", "link", "page"];
  const projects = await getProjects();
  const inbox = projects.find(project => project.is_inbox_project === true);
  inbox.order = -1;

  browser.menus.create({
    contexts,
    id: "0-Inbox",
    title: "&Send to Inbox",
    ...(IS_CHROME
      ? null
      : { icons: { 16: `icons/project-color-${inbox.color}.svg` } })
  });
  browser.menus.create({
    contexts,
    id: "inbox-separator",
    type: "separator"
  });

  projects
    .sort((a, b) => a.order - b.order)
    .forEach(({ id, name, color }, index) => {
      const icons = IS_CHROME
        ? null
        : { icons: { 16: `icons/project-color-${color}.svg` } };
      const parentId = browser.menus.create({
        contexts,
        id: String(id),
        title: `&${index + 1} ${name}`,
        ...icons
      });
      DUE_STRINGS.forEach((dueString, dueIndex) => {
        browser.menus.create({
          contexts,
          id: `${index}-due-${dueString}`,
          title: `&${dueIndex + 1} ${dueString}`,
          parentId
        });
      });
      browser.menus.create({
        contexts,
        id: `${index}-due`,
        title: `&${DUE_STRINGS.length + 1} No due date`,
        parentId
      });
    });
}

function setOnboardingMenuAction() {
  browser.menus.create({
    contexts: ["all"],
    id: "set-todoist-key",
    title: "Send to Todoist: Enter Personal API token"
  });
}

browser.runtime.onInstalled.addListener(async () => {
  await browser.menus.removeAll();
  const key = await getApiKey();
  if (key) {
    setProjectMenus();
  } else {
    setOnboardingMenuAction();
  }
});

browser.runtime.onStartup.addListener(async () => {
  await browser.menus.removeAll();
  const key = await getApiKey();
  if (key) {
    setProjectMenus();
  } else {
    setOnboardingMenuAction();
  }
});

browser.runtime.onMessage.addListener(async ({ status }, _sender, reply) => {
  if (status === "API_KEY_SET") {
    await browser.menus.remove("set-todoist-key");
    setProjectMenus();
  }
  if (status === "API_KEY_REQUIRED") {
    await browser.menus.removeAll();
    setOnboardingMenuAction();
  }
  if (status === "SYNC_PROJECTS") {
    await browser.menus.removeAll();
    await setProjectMenus();
    reply({ message: "SYNC_COMPLETE" });
  }
});

async function saveTask(event) {
  if (event.menuItemId === "set-todoist-key") {
    return browser.runtime.openOptionsPage();
  }

  const key = await getApiKey();
  let content = event.selectionText || event.linkText;

  if (event.linkUrl) {
    content += ` | ${event.linkUrl}`;
  }

  if (!content && event.pageUrl) {
    const [title] = await browser.tabs.executeScript({
      code: "document.title"
    });
    content = `[${title}](${event.pageUrl})`;
  }

  if (content) {
    const projects = await getProjects();
    const dueString = event.menuItemId.split("-").pop();
    const { id: projectId, name: projectName } =
      projects.find(({ id }) => id === event.parentMenuItemId) || {};

    const response = await fetch("https://api.todoist.com/rest/v2/tasks", {
      method: "post",
      body: JSON.stringify({
        content,
        project_id: projectId,
        due_string: DUE_STRINGS.includes(dueString) ? dueString : undefined
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
        title: `New ${projectName || "Inbox"} task created!`,
        message: data.url,
        iconUrl: "icons/SendToTodoist.svg"
      });
    }
  } else {
    await browser.notifications.create("noTask", {
      type: "basic",
      title: `No content found`,
      message: JSON.stringify(event),
      iconUrl: "icons/SendToTodoist.svg"
    });
  }
}

browser.menus.onClicked.addListener(saveTask);

browser.notifications.onClicked.addListener(async id => {
  if (id === "newTask") {
    const { newTask } = await browser.notifications.getAll();
    await browser.tabs.create({ active: false, url: newTask.message });
  }
});

browser.commands.onCommand.addListener(async command => {
  if (command === "save-page") {
    const key = await getApiKey();
    if (!key) {
      return browser.tabs.executeScript({
        code: "alert('Please enter API key in extension popup')"
      });
    }

    const projects = await getProjects();
    const inbox = projects.find(project => project.is_inbox_project === true);
    const [pageUrl] = await browser.tabs.executeScript({
      code: "location.href"
    });
    saveTask({ pageUrl, menuItemId: "0-Inbox", parentMenuItemId: inbox.id });
  }
});
