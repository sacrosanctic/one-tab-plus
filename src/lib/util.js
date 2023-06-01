import { andThen, assoc, forEach, objOf, pipe, pluck, propEq, when } from 'ramda'
import { APP_FOLDER_NAME, OTHER_BOOKMARKS_ID } from './constant'

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
	)('onetabplus.html')

export const removeBookmark = async ({ id, parentId }) => {
	await chrome.bookmarks.remove(id)
	await deleteEmptyFolder(parentId)
	loadBookmarks()
}

export const openBookmark = async (bookmark) => {
	await chrome.tabs.create({ active: false, url: bookmark.url })
	removeBookmark(bookmark)
}

export const deleteEmptyFolder = async (id) =>
	pipe(
		chrome.bookmarks.getChildren(id),
		andThen(when(propEq(0, 'length'), chrome.bookmarks.remove(id))),
	)()

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
	chrome.tabs.remove(pluck('id', allTabs))
}

export const getFavicon = (u) => {
	const url = new URL(chrome.runtime.getURL('/_favicon/'))
	url.searchParams.set('pageUrl', u)
	url.searchParams.set('size', '64')
	return url.toString()
}

export const updateTitle = ({ id, title }) => chrome.bookmarks.update(id, { title })
