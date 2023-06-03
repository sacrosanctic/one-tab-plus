import { assoc, forEach, objOf, pipe, pluck, propEq, when } from 'ramda'
import { APP_FOLDER_NAME, MAIN_PAGE, OTHER_BOOKMARKS_ID } from './constant'

export const saveCurrentTab = async () => {
	const { title, url, id } = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
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

	await chrome.bookmarks.create({ title, url, parentId })
	chrome.tabs.remove(id)
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

export const deleteEmptyFolder = async (id) => {
	const children = chrome.bookmarks.getChildren(id)
	when(
		//
		propEq(0, 'length'),
		chrome.bookmarks.remove(id),
		children,
	)
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

export const updateTitle = ({ id, title }) => chrome.bookmarks.update(id, { title })

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
