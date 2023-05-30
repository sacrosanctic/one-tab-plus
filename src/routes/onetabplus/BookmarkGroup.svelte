<script>
	import InPlaceInput from './InPlaceInput.svelte'
	import { fade } from 'svelte/transition'
	import Bookmark from './Bookmark.svelte'
	import { dndzone } from 'svelte-dnd-action'

	export let bookmarks = {}

	const flipDurationMs = 300
	const handleDndConsider = (e) => {
		bookmarks.children = e.detail.items
	}
	const handleDndFinalize = (e) => {
		bookmarks.children = e.detail.items
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
