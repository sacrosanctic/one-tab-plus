const { tabs, runtime, action, contextMenus, bookmarks } = chrome;

const openTabList = () => {
	const fileName = 'index.html';
	const url = runtime.getURL(fileName);
	tabs.create({ url });
};

const saveCurrentTab = async () => {
	const { title, url, id } = (await tabs.query({ active: true, currentWindow: true }))[0];

	const test1 = await bookmarks.create({ title, url });
	tabs.remove(id);
};

// left click toolbar icon
action.onClicked.addListener(saveCurrentTab);

// create context menu for right click toolbar icon
contextMenus.create({
	title: 'Display Tab List',
	contexts: ['action'],
	id: 'openTabList'
});

// listen for right clicks for toolbar icon
contextMenus.onClicked.addListener((e) => {
	switch (e.menuItemId) {
		case 'openTabList':
			openTabList();
			break;

		default:
			break;
	}
});
