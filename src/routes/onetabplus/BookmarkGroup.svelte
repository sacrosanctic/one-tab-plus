<script lang="ts">
	import InPlaceInput from './InPlaceInput.svelte'
	import { addSortable, openAllTabs } from '$lib/utils'
	import type { BookmarkType } from '$lib/types'
	import Bookmark from './Bookmark.svelte'

	let getChildren = () => {
		chrome.bookmarks.getChildren(bookmarks.id).then((v) => (children = v))
	}

	let { bookmarks } = $props<{ bookmarks: BookmarkType }>()

	let children: BookmarkType[] = $state([])

	$effect(getChildren)
</script>

<div>
	<h2 class="text-lg text-gray-500 dark:text-white font-semibold capitalize">
		<InPlaceInput
			onChange={(title) => chrome.bookmarks.update(bookmarks.id, { title })}
			value={bookmarks.title}
		/>
	</h2>
	<button
		class="text-sm"
		on:click={() => openAllTabs(bookmarks.id)}>Open All</button
	>

	<section class="text-gray-500 text-lg dark:text-gray-400 w-full">
		<ul
			class="space-y-2 min-h-16"
			use:addSortable={{ group: 'same' }}
		>
			{#each children as bookmark (bookmark.id)}
				<Bookmark
					{bookmark}
					onUpdate={getChildren}
				/>
			{/each}
		</ul>
	</section>
</div>
