chrome.action.onClicked.addListener(() => {
	const fileName = 'index.html';
	const url = chrome.runtime.getURL(fileName);
	chrome.tabs.create({ url });
});
