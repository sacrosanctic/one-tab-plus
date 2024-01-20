<script>
	import { ANIMATION_DURATION, APP_NAME } from '$lib/constant'
	import autoAnimate from '@formkit/auto-animate'
	import {
		moveBookmark,
		openAllTabs,
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
	import BookmarkGroup from './BookmarkGroup.svelte'

	$: numOfTabs = reduce(
		useWith(add, [
			//
			identity,
			pathOr(0, ['children', 'length']),
		]),
		0,
	)(data.bookmarks)

	onMount(() => {})

	const reset = () => {
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
	}

	export let data
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<main class="m-2">
	<button
		type="button"
		class="btn"
		on:click={saveAllTabs}>get all tabs</button
	>
	<button
		class="btn"
		type="button"
		on:click={openTabList}
	>
		<i class="fas fa-up-right-from-square" />
	</button>
	<button
		class="btn"
		type="button"
		on:click={() => sortBookmark([ascend(prop('dateAdded'))])}
	>
		<i class="fas fa-arrow-down-long" />
		<i class="fas fa-calendar" />
	</button>
	<button
		class="btn"
		type="button"
		on:click={() => sortBookmark([descend(prop('dateAdded'))])}
	>
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
	<button
		class="btn"
		type="button"
		on:click={reset}
	>
		<i class="fas fa-filter-circle-xmark" />
	</button>
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">
		{APP_NAME} - {numOfTabs} tabs
	</h2>
	<div
		class="space-y-2"
		use:autoAnimate={{ duration: ANIMATION_DURATION }}
	>
		{#each data.bookmarks as bookmarks (bookmarks.id)}
			<div>
				<BookmarkGroup
					{bookmarks}
					on:titleChange={(e) => updateTitle(e.detail)}
					on:openBookmark={(e) => openBookmark(e.detail)}
					on:removeBookmark={(e) => removeBookmark(e.detail)}
					on:moveBookmark={(e) => moveBookmark(...e.detail)}
					on:openAllTabs={(e) => openAllTabs(e.detail)}
				/>
			</div>
		{/each}
	</div>
</main>
