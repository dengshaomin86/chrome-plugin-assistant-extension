chrome.runtime.onInstalled.addListener(() => {
  console.log("Assistant Extension Installed");

  // 创建右键菜单
  // chrome.contextMenus.create({
  //   id: "asContextMenu1",
  //   title: "AS: %s", // %s 会自动替换为选中的文字
  //   contexts: ["page", "selection", "image", "link"], // 任意空白处，选中文字、图片或链接时显示
  // });

  chrome.contextMenus.create({
    id: "as-Addbookmark",
    title: "添加书签",
    contexts: ["page", "link"],
  });

  chrome.contextMenus.create({
    id: "as-Pageinfo",
    title: "下载",
    contexts: ["page", "link"],
  });

  chrome.contextMenus.create({
    id: "as-dy-cookies",
    title: "复制cookies",
    contexts: ["page", "link"],
    documentUrlPatterns: ["https://*.douyu.com/*"],
  });
});

// 监听点击右键菜单
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    const url = info.linkUrl || tab.url;
    const { title } = tab;
    if (info.menuItemId === "as-Addbookmark") {
      await sendMessageToElectron({ type: "Addbookmark", url, title });
    }

    if (info.menuItemId === "as-Pageinfo") {
      const cookies = await getCookiesByUrl(url);
      await sendMessageToElectron({ type: "Pageinfo", url, cookies });
    }

    if (info.menuItemId === "as-dy-cookies") {
      const __all_cookies = await getCookiesByUrl(url);
      const cookies = __all_cookies.filter((v) => !/\.msg\./i.test(v.domain) && ["acf_auth", "acf_jwt_token"].includes(v.name)).map(({ name, value }) => ({ name, value }));
      const __val = { type: "SyncDYCookies", cookies };
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (text) => navigator.clipboard.writeText(text),
        args: [JSON.stringify(__val)],
      });
      notification(`到期：${tokenExpire(cookies.find((v) => v.name === "acf_jwt_token")?.value)}`, "复制成功");
      await sendMessageToElectron(__val);
    }
  } catch (error) {
    notification(error.message);
  }
});

// 接收 popup 消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  sendMessageToElectron(message);
  sendResponse("res");
  return true; // Indicates async response
});

// 发送消息给客户端
function sendMessageToElectron(message) {
  return fetch("http://localhost:12323/bridge/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

// 获取当前页签 url
async function getCurrentTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url;
}

// 通过 url 获取 cookies
async function getCookiesByUrl(url) {
  return chrome.cookies.getAll({ domain: new URL(url).hostname.replace(/^www/i, "") });
}

function tokenExpire(token) {
  try {
    const [, str] = token.split(".");
    const exp = JSON.parse(atob(str)).exp * 1000;
    // console.log(`exp: ${new Date(exp)}`);
    // return exp > Date.now();
    return new Date(exp);
  } catch (error) {
    return false;
  }
}

// 显示通知
function notification(message = "", title = "") {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/logo@48.png",
    title,
    message,
    priority: 2,
  });
}
