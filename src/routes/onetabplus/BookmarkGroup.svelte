<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import InPlaceInput from './InPlaceInput.svelte'
	import { isEmpty, isNil } from 'ramda'
	import { ANIMATION_DURATION } from '$lib/constant'
	import autoAnimate from '@formkit/auto-animate'
	import { getFavicon, openAllTabs } from '$lib/util'
	import type { BookmarkType } from '$lib/types'

	const dispatch = createEventDispatcher()

	export let bookmarks: BookmarkType

	const formatDate = (date: number) =>
		new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		}).format(new Date(date))
</script>

{#await chrome.bookmarks.getChildren(bookmarks.id) then children}
	<div transition:fade={{ duration: ANIMATION_DURATION }}>
		<h2 class="text-lg text-gray-500 dark:text-white font-semibold capitalize">
			<InPlaceInput
				onChange={(title) => chrome.bookmarks.update(bookmarks.id, { title })}
				title={bookmarks.title}
			/> tabs
		</h2>
		<button
			class="text-sm"
			on:click={() => openAllTabs(bookmarks.id)}>Open All</button
		>

		<section class="text-gray-500 text-lg dark:text-gray-400 w-full sm:w-4/6">
			<ul
				class="space-y-4"
				use:autoAnimate={{ duration: ANIMATION_DURATION }}
			>
				{#each children as bookmark (bookmark.id)}
					<div class="cursor-default">
						{#if isNil(bookmark) || isEmpty(bookmark)}
							<li
								class="flex items-center gap-2 rounded-md p-2 bg-white dark:bg-inherit dark:border-gray-300 dark:border"
							>
								<div class="ml-1 w-4" />
								<i class="fas fa-xmark h-11 fa-3x aspect-square text-red-200" />
								<div
									class="text-gray-900 dark:text-gray-300 block whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-lg capitalize font-medium leading-tight"
								>
									invalid bookmark
								</div>
							</li>
						{:else}
							<li
								title={bookmark.url}
								class="flex items-center gap-2 rounded-md p-2 bg-white dark:border-gray-300 dark:bg-inherit dark:border"
							>
								<button
									class="w-4 opacity-0"
									on:click={() => dispatch('removeBookmark', bookmark)}
								>
									<i class="fas fa-xmark fa-lg text-gray-400" />
								</button>
								<button
									class="h-9 aspect-square"
									aria-label="drag-handle"
								>
									<img
										class="w-full"
										src={getFavicon(bookmark.url)}
										alt="favicon"
									/>
								</button>

								<div class="overflow-hidden">
									<a
										class="text-gray-900 dark:text-gray-300 block whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-lg capitalize font-medium leading-tight"
										href={bookmark.url}
										on:click|preventDefault={() => dispatch('openBookmark', bookmark)}
									>
										{bookmark.title}
									</a>
									<p class="font-medium text-xs mt-1">
										<i class="far fa-calendar mr-1" />
										{bookmark.dateAdded ? formatDate(bookmark.dateAdded) : 'no date'}
									</p>
								</div>
							</li>
						{/if}
					</div>
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
