const { tabs, runtime, action, contextMenus, bookmarks } = chrome

const appName = 'One Tab Plus'
const secretFolder = `${appName} (Do Not Touch!)`

const openTabList = () => {
	const fileName = 'onetabplus.html'
	const url = runtime.getURL(fileName)
	tabs.create({ url })
}

const findAppFolder = async () => {
	const nodes = await bookmarks.search({ title: secretFolder })

	if (nodes.length === 0) {
		return (await bookmarks.create({ title: secretFolder, parentId: '2' })).id
	}
	return nodes[0].id
}
const appId = findAppFolder()

const saveCurrentTab = async () => {
	const { title, url, id } = (await tabs.query({ active: true, currentWindow: true }))[0]
	const parentId = await findAppFolder()

	console.log(await bookmarks.create({ title, url, parentId }))
	tabs.remove(id)
}

// left click toolbar icon
action.onClicked.addListener(saveCurrentTab)

contextMenus.removeAll()

// create context menu for right click toolbar icon
contextMenus.create({
	title: 'Display Tab List',
	contexts: ['action'],
	id: 'openTabList',
})

// listen for right clicks for toolbar icon
contextMenus.onClicked.addListener((e) => {
	switch (e.menuItemId) {
		case 'openTabList':
			openTabList()
			break

		default:
			break
	}
})
