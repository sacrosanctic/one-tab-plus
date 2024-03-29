<script lang="ts">
	import { APP_NAME, BOOKMARK_NAMES, MAIN_PAGE } from '$lib/constants'
	import {
		getAppFolderId,
		getBookmarkIdByTitle,
		isFolder,
		openTabList,
		saveAllTabs,
	} from '$lib/utils'
	import { filter } from 'ramda'

	import BookmarkGroup from './BookmarkGroup.svelte'
	import { browser } from '$app/environment'
	import type { BookmarkType } from '$lib/types'
	import type { Snapshot } from '@sveltejs/kit'

	export const snapshot: Snapshot<number> = {
		capture: () => scrollY,
		restore: (top) => {
			const scrollFn = () => window.scrollBy({ behavior: 'smooth', top })

			setTimeout(scrollFn, 500)
		},
	}

	const loadRoot = () =>
		getAppFolderId()
			.then(chrome.bookmarks.getChildren)
			.then(filter(isFolder))
			.then((bookmarks) => {
				return bookmarks.filter(
					(bookmark) =>
						![BOOKMARK_NAMES.INTAKE, BOOKMARK_NAMES.YOUTUBE].some((v) => v === bookmark.title),
				)
			})

	let scrollY: number = $state(0)
	let bookmarkGroups: BookmarkType[] = $state([])
	let intake: BookmarkType[] = $state([])
	let youtube: BookmarkType[] = $state([])

	$effect(() => {
		const intakeId = getBookmarkIdByTitle('intake')
		const youtubeId = getBookmarkIdByTitle('youtube')

		chrome.bookmarks.onCreated.addListener(async (id, bookmark) => {
			if (bookmark.parentId === (await intakeId)) {
				intakeId.then(chrome.bookmarks.get).then((data) => (intake = data))

				return
			}

			if (bookmark.parentId === (await youtubeId)) {
				youtubeId.then(chrome.bookmarks.get).then((data) => (youtube = data))

				return
			}

			loadRoot().then((data) => (bookmarkGroups = data))
		})

		intakeId.then(chrome.bookmarks.get).then((data) => (intake = data))
		youtubeId.then(chrome.bookmarks.get).then((data) => (youtube = data))
		loadRoot().then((data) => (bookmarkGroups = data))
	})
</script>

<svelte:window bind:scrollY />

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
			<div class="space-y-2">
				{#each bookmarkGroups as data (data.id)}
					<BookmarkGroup bookmarks={data} />
				{/each}
			</div>
			<div class="space-y-2">
				{#each intake as bookmarks (bookmarks.id)}
					<BookmarkGroup {bookmarks} />
				{/each}
				{#each youtube as bookmarks (bookmarks.id)}
					<BookmarkGroup {bookmarks} />
				{/each}
			</div>
		{/if}
	</div>
</main>
