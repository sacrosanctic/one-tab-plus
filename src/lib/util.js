import { andThen, assoc, find, forEach, objOf, path, pipe, pluck, propEq, when } from 'ramda'
import { APP_FOLDER_NAME, MAIN_PAGE, OTHER_BOOKMARKS_ID } from './constant'

export const saveCurrentTab = async () => {
	const nodes = await chrome.tabs.query({ active: true, currentWindow: true })
	const bookmark = nodes[0]
	const { title, url, id } = bookmark

	await chrome.bookmarks.create({ title, url, parentId: await getIntakeBookmark() })
	chrome.tabs.remove(id)
}

export const getIntakeBookmark = async () => {
	const appFolderId = await getAppFolderId()
	const children = await chrome.bookmarks.getChildren(appFolderId)
	const bookmark = find(propEq('intake', 'title'), children)

	return bookmark
		? bookmark.id
		: (await chrome.bookmarks.create({ title: 'intake', parentId: appFolderId, index: 0 })).id
}

export const isFolder = (node) => propEq(undefined, 'url', node)

export const getAppFolderId = async () => {
	const nodes = await chrome.bookmarks.search({ title: APP_FOLDER_NAME })

	if (nodes.length === 0) {
		return (await chrome.bookmarks.create({ title: APP_FOLDER_NAME, parentId: OTHER_BOOKMARKS_ID }))
			.id
	} else {
		if (!isFolder(nodes[0])) {
			throw Error()
		}
		return nodes[0].id
	}
}

export const openTabList = () =>
	pipe(
		//
		chrome.runtime.getURL,
		objOf('url'),
		assoc('pinned', true),
		chrome.tabs.create,
	)(MAIN_PAGE)

export const removeBookmark = async ({ id, parentId }) => {
	await chrome.bookmarks.remove(id)
	await deleteEmptyFolder(parentId)
}

export const openBookmark = async (bookmark) => {
	await chrome.tabs.create({ active: false, url: bookmark.url })
	removeBookmark(bookmark)
}

export const moveBookmark = async (id, obj) => {
	const bookmark = await chrome.bookmarks.get(id)
	const parentId = path([0, 'parentId'], bookmark)

	await chrome.bookmarks.move(id, obj)
	await deleteEmptyFolder(parentId)
}
export const openAllTabs = async (id) => {
	const children = await chrome.bookmarks.getChildren(id)

	for (const child of children) {
		await chrome.tabs.create({ url: child.url })
		await chrome.bookmarks.remove(child.id)
	}
	await deleteEmptyFolder(id)
}

export const deleteEmptyFolder = async (id) => {
	await pipe(
		() => chrome.bookmarks.getChildren(id),
		andThen(
			when(
				//
				propEq(0, 'length'),
				() => chrome.bookmarks.remove(id),
			),
		),
	)()
}

export const onBookmarkChange = (handler) =>
	forEach(
		(event) => chrome.bookmarks[event].addListener(handler),
		['onCreated', 'onChanged', 'onMoved', 'onRemoved', 'onChildrenReordered'],
	)

export const saveAllTabs = async () => {
	let allTabs = await chrome.tabs.query({
		currentWindow: true,
		pinned: false,
		windowType: 'normal',
	})
	const extensionUrl = chrome.runtime.getURL('/')

	allTabs = allTabs.filter((tab) => !tab.url.startsWith(extensionUrl))
	allTabs = allTabs.sort((a, b) => b.index - a.index)

	const date = Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
	}).format(new Date())

	const bookmark = await chrome.bookmarks.create({
		title: date,
		parentId: await getAppFolderId(),
		index: 0,
	})
	const parentId = bookmark.id

	for (const { title, url } of allTabs) {
		await chrome.bookmarks.create({ title, url, parentId, index: 0 })
	}
	//prevent window from closing by opening a new tab
	await chrome.tabs.create({ active: false, url: 'chrome://newtab' })
	chrome.tabs.remove(pluck('id', allTabs))
}

export const getFavicon = (u) => {
	const url = new URL(chrome.runtime.getURL('/_favicon/'))
	url.searchParams.set('pageUrl', u)
	url.searchParams.set('size', '64')
	return url.toString()
}

/**
 *
 * @param {*} action
 *
 * defines an event on action button left click
 */
export const onActionLeftClick = (action) => {
	switch (action) {
		case 'saveCurrentTab':
			chrome.action.onClicked.addListener(saveCurrentTab)
			break
		case 'openSidePanel':
			chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
			break
		default:
			break
	}
}

export const onActionRightClick = () => {
	// create context menu
	chrome.contextMenus.removeAll()

	const menus = [
		{
			title: 'Open as Tab',
			id: 'openTab',
		},
		{
			title: 'Open as Side Panel',
			id: 'openSidePanel',
		},
	]
	forEach(
		(menu) =>
			chrome.contextMenus.create({
				...menu,
				contexts: ['action'],
			}),
		menus,
	)

	// listen for right clicks for toolbar icon
	chrome.contextMenus.onClicked.addListener(async (e) => {
		switch (e.menuItemId) {
			case 'openTab':
				openTabList()
				break
			case 'openSidePanel':
				console.log('sidepanel')
				chrome.sidePanel.setOptions({ enabled: true, path: 'onetabplus.html' })
				break
			default:
				break
		}
	})
}
