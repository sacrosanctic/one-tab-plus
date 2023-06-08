<script>
	import InPlaceInput from './InPlaceInput.svelte'
	import { fade } from 'svelte/transition'
	import { dndzone } from 'svelte-dnd-action'
	import { isEmpty, isNil } from 'ramda'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let bookmarks = {}

	const flipDurationMs = 300
	const handleDndConsider = (e) => {
		bookmarks.children = e.detail.items
	}
	const handleDndFinalize = (e) => {
		bookmarks.children = e.detail.items
	}

	const formatDate = (date) =>
		new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		}).format(new Date(date))
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
				<!-- <Bookmark {bookmark} on:openBookmark on:removeBookmark />
				 -->
				{#if isNil(bookmark) || isEmpty(bookmark)}
					<li
						class="flex items-center gap-2 rounded-md p-2 bg-white dark:bg-inherit dark:border-gray-300 dark:border"
					>
						<div class="ml-1 w-4" />
						<i class="fas fa-xmark h-11 fa-3x aspect-square text-red-200" />
						<div
							class="text-gray-900 dark:text-gray-300 block whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-lg capitalize font-medium leading-none"
						>
							invalid bookmark
						</div>
					</li>
				{:else}
					<li
						title={bookmark.url}
						class="flex items-center gap-2 rounded-md p-2 bg-white dark:border-gray-300 dark:bg-inherit dark:border"
					>
						<button class="w-4 opacity-0" on:click={dispatch('removeBookmark', bookmark)}>
							<i class="fas fa-xmark fa-lg text-gray-400" />
						</button>
						<button aria-label="drag-handle">
							<img class="h-9 aspect-square" src={bookmark.favicon} alt="favicon" />
						</button>

						<div class="overflow-hidden">
							<a
								class="text-gray-900 dark:text-gray-300 block whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-lg capitalize font-medium leading-none"
								href={bookmark.url}
								on:click|preventDefault={dispatch('openBookmark', bookmark)}
							>
								{bookmark.title}
							</a>
							<p class="font-medium text-xs mt-1">
								<i class="far fa-calendar mr-1" />
								{formatDate(bookmark.dateAdded)}
							</p>
						</div>
					</li>
				{/if}
			{/each}
		</ul>
	</section>
</div>

<style lang="postcss">
	li:hover button {
		@apply opacity-100;
	}
</style>
