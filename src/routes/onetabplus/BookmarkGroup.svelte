<script>
	import { fade } from 'svelte/transition'
	import Bookmark from './Bookmark.svelte'

	export let bookmarks = []
</script>

{#each bookmarks as { children, title, id } (id)}
	<div transition:fade>
		<h2 class=" text-lg text-gray-900 dark:text-white mb-2 font-semibold">
			{title} - {children.length} tabs
		</h2>
		<table class="ml-2 space-y-1 text-gray-500 text-lg dark:text-gray-400 w-1/2">
			<tbody>
				{#each children as bookmark (bookmark.id)}
					<Bookmark {bookmark} on:openBookmark on:removeBookmark />
				{/each}
			</tbody>
		</table>
	</div>
{/each}
