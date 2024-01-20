<script lang="ts">
	import { fade } from 'svelte/transition'
	import InPlaceInput from './InPlaceInput.svelte'
	import { ANIMATION_DURATION } from '$lib/constants'
	import autoAnimate from '@formkit/auto-animate'
	import { openAllTabs } from '$lib/utils'
	import type { BookmarkType } from '$lib/types'
	import Bookmark from './Bookmark.svelte'

	export let bookmarks: BookmarkType
</script>

{#await chrome.bookmarks.getChildren(bookmarks.id) then children}
	<div>
		<h2 class="text-lg text-gray-500 dark:text-white font-semibold capitalize">
			<InPlaceInput
				onChange={(title) => chrome.bookmarks.update(bookmarks.id, { title })}
				title={bookmarks.title}
			/>
		</h2>
		<button
			class="text-sm"
			on:click={() => openAllTabs(bookmarks.id)}>Open All</button
		>

		<section class="text-gray-500 text-lg dark:text-gray-400 w-full">
			<ul class="space-y-2">
				{#each children as bookmark (bookmark.id)}
					<Bookmark {bookmark} />
				{/each}
			</ul>
		</section>
	</div>
{/await}

<style lang="postcss">
	li:hover button {
		@apply opacity-100;
	}
</style>
