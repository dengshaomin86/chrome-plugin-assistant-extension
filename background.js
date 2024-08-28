chrome.runtime.onInstalled.addListener(() => {
  console.log("Assistant Extension Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  sendMessageToElectron(message);
  sendResponse("res");
  return true; // Indicates async response
});

function sendMessageToElectron(message) {
  fetch("http://localhost:12323/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  })
    .then((data) => {
      // console.log("Response from Electron:", data);
    })
    .catch((error) => {
      console.error(error);
    });
}
