import { assoc, objOf, path, pipe } from 'ramda'
import { APP_FOLDER_NAME, BOOKMARK_NAMES, MAIN_PAGE, OTHER_BOOKMARKS_ID } from './constants'
import type { BookmarkType } from './types'

export const saveCurrentTab = async () => {
	const bookmarks = await chrome.tabs.query({ active: true, currentWindow: true })
	const bookmark = bookmarks[0]
	const { title, url, id } = bookmark

	const isYoutube = (url: string) => new URL(url).origin === 'https://www.youtube.com'

	const parentId = await getBookmarkIdByTitle(
		isYoutube(url!) ? BOOKMARK_NAMES.YOUTUBE : BOOKMARK_NAMES.INTAKE,
	)

	await chrome.bookmarks.create({
		title,
		url,
		parentId,
	})

	if (id) chrome.tabs.remove(id)
}

export const getBookmarkIdByTitle = async (title: string) => {
	const appFolderId = await getAppFolderId()
	const children = await chrome.bookmarks.getChildren(appFolderId)
	const bookmark = children.find((child) => child.title === title)

	if (bookmark) return bookmark.id

	const { id } = await chrome.bookmarks.create({
		title,
		parentId: appFolderId,
		index: 0,
	})
	return id
}

export const isFolder = (bookmark: BookmarkType) => bookmark.url === undefined

export const getAppFolderId = async () => {
	const bookmarks = await chrome.bookmarks.search({ title: APP_FOLDER_NAME })

	if (bookmarks.length === 0) {
		const { id } = await chrome.bookmarks.create({
			title: APP_FOLDER_NAME,
			parentId: OTHER_BOOKMARKS_ID,
		})
		return id
	}
	if (!isFolder(bookmarks[0])) throw Error()

	return bookmarks[0].id
}

export const openTabList = () =>
	pipe(
		//
		chrome.runtime.getURL,
		objOf('url'),
		assoc('pinned', true),
		chrome.tabs.create,
	)(MAIN_PAGE)

export const removeBookmark = async (bookmark: BookmarkType) => {
	await chrome.bookmarks.remove(bookmark.id)
	await deleteEmptyFolder(bookmark.parentId!)
}

export const openBookmark = async (bookmark: BookmarkType) => {
	await chrome.tabs.create({ active: false, url: bookmark.url })
	removeBookmark(bookmark)
}

export const moveBookmark = async (id: string, obj: { parentId: string; index: number }) => {
	const bookmark = await chrome.bookmarks.get(id)
	const parentId = path([0, 'parentId'], bookmark)!

	await chrome.bookmarks.move(id, obj)
	await deleteEmptyFolder(parentId)
}
export const openAllTabs = async (id: string) => {
	const children = await chrome.bookmarks.getChildren(id)

	for (const child of children) {
		await chrome.tabs.create({ url: child.url })
		await chrome.bookmarks.remove(child.id)
	}
	await deleteEmptyFolder(id)
}

export const deleteEmptyFolder = async (id: string) => {
	const children = await chrome.bookmarks.getChildren(id)
	if (!children.length) chrome.bookmarks.remove(id)
}

export const onBookmarkChange = (handler: () => void) => {
	const events = ['onCreated', 'onChanged', 'onMoved', 'onRemoved', 'onChildrenReordered'] as const

	events.forEach((event) => {
		chrome.bookmarks[event].addListener(handler)
	})
}

export const saveAllTabs = async () => {
	let allTabs = await chrome.tabs.query({
		currentWindow: true,
		pinned: false,
		windowType: 'normal',
	})
	const extensionUrl = chrome.runtime.getURL('/')

	allTabs = allTabs.filter((tab) => !tab.url?.startsWith(extensionUrl))
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

	chrome.tabs.remove(allTabs.map((tab) => tab.id).filter(Boolean))
}

export const getFavicon = (pageUrl: string) => {
	const url = new URL(chrome.runtime.getURL('/_favicon/'))
	url.searchParams.set('pageUrl', pageUrl)
	url.searchParams.set('size', '64')
	return url.toString()
}

/**
 *
 * @param {*} action
 *
 * defines an event on action button left click
 */
export const onActionLeftClick = (action: string) => {
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
	menus.forEach((menu) =>
		chrome.contextMenus.create({
			...menu,
			contexts: ['action'],
		}),
	)

	// listen for right clicks for toolbar icon
	chrome.contextMenus.onClicked.addListener((e) => {
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
