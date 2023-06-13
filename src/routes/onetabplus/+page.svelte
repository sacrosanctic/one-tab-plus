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
	import {
		add,
		always,
		applySpec,
		ascend,
		assoc,
		converge,
		descend,
		flatten,
		identity,
		map,
		of,
		pathOr,
		pipe,
		pluck,
		prop,
		reduce,
		sortWith,
		useWith,
	} from 'ramda'
	import { onMount } from 'svelte'
	import { flip } from 'svelte/animate'
	import BookmarkGroup from './BookmarkGroup.svelte'
	import { dndFreeze } from '$lib/store'

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
		$dndFreeze = false
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

	const reset = () => {
		$dndFreeze = true
		loadBookmarks()
	}

	const sortBookmark = async (sort) => {
		await loadBookmarks()
		bookmarkTree = pipe(
			//
			pluck('children'),
			flatten,
			map(assoc('parentId', '9999')),
			sortWith(sort),
			applySpec({
				title: always('Sort By Date (Newest)'),
				id: always('9999'),
				dateAdded: always(new Date()),
				index: always(0),
				children: identity,
			}),
			of(Array),
		)(bookmarkTree)
		$dndFreeze = true
	}
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<main class="m-2">
	<button type="button" class="btn" on:click={saveAllTabs}>get all tabs</button>
	<button class="btn" type="button" on:click={openTabList}>
		<i class="fas fa-up-right-from-square" />
	</button>
	<button class="btn" type="button" on:click={() => sortBookmark([ascend(prop('dateAdded'))])}>
		<i class="fas fa-arrow-down-long" />
		<i class="fas fa-calendar" />
	</button>
	<button class="btn" type="button" on:click={() => sortBookmark([descend(prop('dateAdded'))])}>
		<i class="fas fa-arrow-up-long" />
		<i class="fas fa-calendar" />
	</button>
	<button
		class="btn"
		type="button"
		on:click={() =>
			sortBookmark([
				ascend(pipe(prop('url'), (url) => new URL(url).hostname)),
				ascend(prop('title')),
			])}
	>
		<i class="fas fa-arrow-down-long" />
		<i class="fas fa-house" />
	</button>
	<button class="btn" type="button" on:click={reset}>
		<i class="fas fa-filter-circle-xmark" />
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
