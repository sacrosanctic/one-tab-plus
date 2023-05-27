<script>
	import InPlaceInput from './InPlaceInput.svelte'
	import { fade } from 'svelte/transition'
	import Bookmark from './Bookmark.svelte'

	export let bookmarks = {}
</script>

<div transition:fade>
	<h2 class=" text-lg text-gray-900 dark:text-white mb-2 font-semibold">
		<InPlaceInput on:titleChange id={bookmarks.id} title={bookmarks.title} /> - {bookmarks.children
			.length} tabs
	</h2>
	<table class="ml-2 space-y-1 text-gray-500 text-lg dark:text-gray-400 w-1/2">
		<tbody>
			{#each bookmarks.children as bookmark (bookmark.id)}
				<Bookmark {bookmark} on:openBookmark on:removeBookmark />
			{/each}
		</tbody>
	</table>
</div>
