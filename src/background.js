console.log('This is background service worker - edit me!');

const brow = chrome || browser;
const isFirefox = !chrome;

// To be injected to the active tab
async function contentCopy(text) {
  await navigator.clipboard.writeText(text);
}

function cleanUrl(link) {
  let url = new URL(link);
  if (url.host == "l.facebook.com") {
    url = new URL(url.searchParams.get("u"));
    url.searchParams.delete("fbclid");
  }
  return url.toString();
}

async function copyCleanLink(link, tab) {
  // TODO process the link
  const doneLink = cleanUrl(link);
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
