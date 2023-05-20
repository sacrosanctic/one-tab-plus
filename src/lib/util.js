import { objOf, pipe, propEq } from 'ramda'
import { APP_FOLDER_NAME, OTHER_BOOKMARKS_ID } from './constant'

export const saveCurrentTab = async () => {
	const { title, url, id } = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
	const parentId = await getAppFolderId()

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
		chrome.tabs.create,
	)('onetabplus.html')
