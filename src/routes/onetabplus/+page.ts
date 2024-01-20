import { getAppFolderId, isFolder } from '$lib/util'
import { browser } from '$app/environment'
import { filter } from 'ramda'

export const load = async () => {
	if (!browser) return { bookmarks: [] }

	return {
		bookmarks: await getAppFolderId() //
			.then(chrome.bookmarks.getChildren)
			.then(filter(isFolder)),
	}
}
