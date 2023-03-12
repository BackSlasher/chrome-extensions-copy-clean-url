console.log('This is background service worker - edit me!');

const brow = chrome || browser;
const isFirefox = !chrome;

// To be injected to the active tab
async function contentCopy(text) {
  await navigator.clipboard.writeText(text);
}

async function copyCleanLink(link, tab) {
  // TODO process the link
  const doneLink = link;
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: contentCopy,
    args: [doneLink],
  });
}

async function processClick(info, tab) {
  const {linkUrl, menuItemId} = info;
  switch (menuItemId) {
    case 'copyCleanLink':
      await copyCleanLink(linkUrl, tab);
      break;
    default:
      throw new Error(`Uknnown action ${menuItemId}`);
  }
}

function setUpContextMenus() {
  brow.contextMenus.create({
    title: 'Copy clean link',
    type: 'normal',
    id: 'copyCleanLink',
    contexts: ['link'],
  });
}

if (isFirefox) {
  setUpContextMenus();
  browser.contextMenus.onClicked.addListener(processClick);
} else {
  chrome.runtime.onInstalled.addListener(() => {
    setUpContextMenus();
  });
  chrome.contextMenus.onClicked.addListener(processClick);
}
