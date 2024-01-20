<script lang="ts">
	import { APP_NAME, BOOKMARK_NAMES } from '$lib/constants'
	import { getAppFolderId, isFolder, openTabList, saveAllTabs } from '$lib/utils'
	import { filter } from 'ramda'

	import BookmarkGroup from './BookmarkGroup.svelte'
	import { browser } from '$app/environment'

	const loadBookmarks = async () => {
		return await getAppFolderId()
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
	}
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
	>
		<i class="fas fa-arrow-down-long" />
		<i class="fas fa-calendar" />
	</button>
	<button
		class="btn"
		type="button"
	>
		<i class="fas fa-arrow-up-long" />
		<i class="fas fa-calendar" />
	</button>
	<button
		class="btn"
		type="button"
	>
		<i class="fas fa-arrow-down-long" />
		<i class="fas fa-house" />
	</button>
	<button
		class="btn"
		type="button"
	>
		<i class="fas fa-filter-circle-xmark" />
	</button>
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">
		{APP_NAME} tabs
	</h2>
	<div class="grid grid-cols-2 gap-2">
		{#if browser}
			{#await loadBookmarks() then asdf}
				<div>
					{#each asdf.other as bookmarks (bookmarks.id)}
						<BookmarkGroup {bookmarks} />
					{/each}
				</div>
				<div class="space-y-2">
					{#each asdf.intake as bookmarks (bookmarks.id)}
						<BookmarkGroup {bookmarks} />
					{/each}
					{#each asdf.youtube as bookmarks (bookmarks.id)}
						<BookmarkGroup {bookmarks} />
					{/each}
				</div>
			{/await}
		{/if}
	</div>
</main>
