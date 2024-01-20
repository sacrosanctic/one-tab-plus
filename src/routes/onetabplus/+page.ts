import { getAppFolderId, isFolder } from '$lib/utils'
import { browser } from '$app/environment'
import { filter } from 'ramda'
import { BOOKMARK_NAMES } from '$lib/constants'

export const load = async () => {
	if (!browser)
		return {
			bookmarks: {
				intake: [],
				youtube: [],
				other: [],
			},
		}

	const bookmarks = await getAppFolderId()
		.then(chrome.bookmarks.getChildren)
		.then(filter(isFolder))
		.then((bookmarks) => {
			let bookmarkGroups: Record<
				'intake' | 'youtube' | 'other',
				chrome.bookmarks.BookmarkTreeNode[]
			> = {
				intake: [],
				youtube: [],
				other: [],
			}

			bookmarks.forEach((bookmark) => {
				if (bookmark.title === BOOKMARK_NAMES.INTAKE)
					bookmarkGroups[BOOKMARK_NAMES.INTAKE].push(bookmark)
				else if (bookmark.title === BOOKMARK_NAMES.YOUTUBE)
					bookmarkGroups[BOOKMARK_NAMES.YOUTUBE].push(bookmark)
				else bookmarkGroups.other.push(bookmark)
			})

			return bookmarkGroups
		})

	return { bookmarks }
}
