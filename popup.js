document.getElementById("Addbookmark").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const { url, title } = tab;
    chrome.runtime.sendMessage({ type: "Addbookmark", url, title }, (response) => {
      console.log("Response from background:", response);
    });
  });
});

document.getElementById("Pageinfo").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    chrome.cookies.getAll({ domain: new URL(url).hostname.replace(/^www/i, "") }, (cookies) => {
      chrome.runtime.sendMessage({ type: "Pageinfo", url, cookies }, (response) => {
        console.log("Response from background:", response);
      });
    });
  });
});
