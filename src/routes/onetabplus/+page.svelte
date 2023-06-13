<script>
	import { ANIMATION_DURATION, APP_NAME } from '$lib/constant'
	import {
		getAppFolderId,
		getFavicon,
		isFolder,
		onBookmarkChange,
		openBookmark,
		openTabList,
		removeBookmark,
		saveAllTabs,
		updateTitle,
	} from '$lib/util'
	import { add, assoc, converge, identity, map, pathOr, pipe, prop, reduce, useWith } from 'ramda'
	import { onMount } from 'svelte'
	import { flip } from 'svelte/animate'
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
		useWith(add, [
			//
			identity,
			pathOr(0, ['children', 'length']),
		]),
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
	<button type="button" class="btn" on:click={saveAllTabs}>get all tabs</button>
	<button class="btn" type="button" on:click={openTabList}>
		<i class="fas fa-up-right-from-square" />
	</button>
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">
		{APP_NAME} - {numOfTabs} tabs
	</h2>
	<div class="space-y-2">
		{#each bookmarkTree as bookmarks (bookmarks.id)}
			<div animate:flip={{ duration: ANIMATION_DURATION }}>
				<BookmarkGroup
					{bookmarks}
					on:titleChange={(e) => updateTitle(e.detail)}
					on:openBookmark={(e) => openBookmark(e.detail)}
					on:removeBookmark={(e) => removeBookmark(e.detail)}
				/>
			</div>
		{/each}
	</div>
</main>
