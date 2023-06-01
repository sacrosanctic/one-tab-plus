<script>
	import { createEventDispatcher } from 'svelte'
	import { dndzone } from 'svelte-dnd-action'
	import { fade } from 'svelte/transition'
	import Bookmark from './Bookmark.svelte'
	import InPlaceInput from './InPlaceInput.svelte'

	const dispatch = createEventDispatcher()

	export let bookmarks = {}

	const findIndexOfNewItem = (arr1, arr2) => {
		if (arr1.length >= arr2.length) return -1
		if (arr1.length === 0) return 0

		for (let i = 0; i < arr2.length; i++) {
			if (arr1[i] !== arr2[i]) return i
		}

		// If no mismatch is found, return fail(-1)
		return -1
	}

	const flipDurationMs = 300
	const handleDndConsider = (e) => {
		bookmarks.children = e.detail.items
	}
	const handleDndFinalize = (e) => {
		// chrome.bookmarks.move(id,{index:0,parentId})

		// console.log(bookmarks.children, e.detail.items)

		// console.log(`parentId: ${bookmarks.id}`)
		// console.log(`index: ${findIndexOfNewItem(bookmarks.children, e.detail.items)}`)
		// console.log(`id: ${e.detail.info.id}`)
		// console.log(e)

		const index = findIndexOfNewItem(bookmarks.children, e.detail.items)

		if (index !== -1) {
			bookmarks.children = e.detail.items
			dispatch('moveBookmark', [
				e.detail.info.id,
				{
					index,
					parentId: bookmarks.id,
				},
			])
		}
	}
</script>

<div transition:fade>
	<h2 class="text-lg text-gray-500 dark:text-white mb-2 font-semibold capitalize">
		<InPlaceInput on:titleChange id={bookmarks.id} title={bookmarks.title} /> - {bookmarks.children
			.length} tabs
	</h2>
	<section class="text-gray-500 text-lg dark:text-gray-400 w-full sm:w-4/6">
		<ul
			use:dndzone={{ items: bookmarks.children, flipDurationMs }}
			on:consider={handleDndConsider}
			on:finalize={handleDndFinalize}
			class="space-y-4"
		>
			{#each bookmarks.children as bookmark (bookmark.id)}
				<Bookmark {bookmark} on:openBookmark on:removeBookmark />
			{/each}
		</ul>
	</section>
</div>
