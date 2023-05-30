<script>
	import { APP_NAME } from '$lib/constant'
	import {
		getAppFolderId,
		getFavicon,
		isFolder,
		onBookmarkChange,
		openBookmark,
		removeBookmark,
		saveAllTabs,
		updateTitle,
	} from '$lib/util'
	import { add, assoc, converge, identity, map, pathOr, pipe, prop, reduce, useWith } from 'ramda'
	import { onMount } from 'svelte'
	import BookmarkGroup from './BookmarkGroup.svelte'

	let bookmarkTree = []

	const loadBookmarks = async () => {
		const appFolderId = await getAppFolderId()
		const root = await chrome.bookmarks.getChildren(appFolderId)
		let temp = []

		for (const bookmark of root) {
			if (isFolder(bookmark)) {
				let children
				children = await chrome.bookmarks.getChildren(bookmark.id)
				children = map(
					converge(
						//
						assoc('favicon'),
						[pipe(prop('url'), getFavicon), identity],
					),
					children,
				)
				temp.push({ ...bookmark, children })
			} else {
				// ignore for now
				// put in a separate folder for processing, maybe user entry via mobile devices
			}
		}
		bookmarkTree = temp
	}

	$: numOfTabs = reduce(
		useWith(add, [identity, pathOr(0, ['children', 'length'])]),
		0,
	)(bookmarkTree)

	onMount(() => {
		loadBookmarks()
		onBookmarkChange(loadBookmarks)
	})
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<main class="m-2">
	<button class="btn btn-primary" on:click={saveAllTabs}>get all tabs</button>
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
		{APP_NAME} - {numOfTabs} tabs
	</h2>
	<div class="space-y-2">
		{#each bookmarkTree as bookmarks}
			<BookmarkGroup
				{bookmarks}
				on:titleChange={(e) => updateTitle(e.detail)}
				on:openBookmark={(e) => openBookmark(e.detail)}
				on:removeBookmark={(e) => removeBookmark(e.detail)}
			/>
		{/each}
	</div>
</main>
