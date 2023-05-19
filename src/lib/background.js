import { openTabList, saveCurrentTab } from '$lib/util'

// left click toolbar icon
chrome.action.onClicked.addListener(saveCurrentTab)

// create context menu for right click toolbar icon
chrome.contextMenus.removeAll()
chrome.contextMenus.create({
	title: 'Display Tab List',
	contexts: ['action'],
	id: 'openTabList',
})

// listen for right clicks for toolbar icon
chrome.contextMenus.onClicked.addListener((e) => {
	switch (e.menuItemId) {
		case 'openTabList':
			openTabList()
			break
		default:
			break
	}
})
