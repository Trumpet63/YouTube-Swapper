// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when on a YouTube page
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'www.youtube.com' }
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

const youtubePattern = "https://www.youtube.com/*";

const filter = {
	urls: [youtubePattern],
	windowId: chrome.windows.WINDOW_ID_CURRENT
}
 
function handleUpdated(tabId, changeInfo, tab) {
	console.log(`Updated tab: ${tabId}`);
	console.log("Changed attributes: ", changeInfo);
	console.log("New tab Info: ", tab);
	if (changeInfo.status == "complete") {
		chrome.tabs.sendMessage(tabId, {data: tab}, function(response) {
			console.log(response);
		});
	}
}

// Listen for when a tab changes state
chrome.tabs.onUpdated.addListener(handleUpdated);

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    // if(changeInfo && changeInfo.status == "complete"){
        // console.log("Tab updated: " + tab.url);

        // chrome.tabs.sendMessage(tabId, {data: tab}, function(response) {
            // console.log(response);
        // });

    // }
// });