<script>
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import InPlaceInput from './InPlaceInput.svelte'
	import { dndzone, SOURCES, TRIGGERS, SHADOW_PLACEHOLDER_ITEM_ID } from 'svelte-dnd-action'
	import { findIndex, isEmpty, isNil, propEq } from 'ramda'
	import { flip } from 'svelte/animate'
	import { ANIMATION_DURATION } from '$lib/constant'
	import { dndFreeze } from '$lib/store'
	import autoAnimate from '@formkit/auto-animate'

	const dispatch = createEventDispatcher()

	export let bookmarks = {}
	let dragDisabled = true
	let originalPosition

	const handleDndConsider = (e) => {
		if (e.detail.info.trigger === TRIGGERS.DRAG_STARTED)
			originalPosition = findIndex(propEq(SHADOW_PLACEHOLDER_ITEM_ID, 'id'), e.detail.items)

		bookmarks.children = e.detail.items

		// Ensure dragging is stopped on drag finish via keyboard
		if (
			e.detail.info.source === SOURCES.KEYBOARD &&
			e.detail.info.trigger === TRIGGERS.DRAG_STOPPED
		)
			dragDisabled = true
	}

	const handleDndFinalize = (e) => {
		bookmarks.children = e.detail.items
		if (e.detail.info.source === SOURCES.POINTER) dragDisabled = true
		if (e.detail.info.trigger === TRIGGERS.DROPPED_INTO_ANOTHER) return

		const index = findIndex(propEq(e.detail.info.id, 'id'), e.detail.items)
		const offset = !originalPosition && originalPosition < index ? 1 : 0

		dispatch('moveBookmark', [
			e.detail.info.id,
			{
				index: index + offset,
				parentId: bookmarks.id,
			},
		])
	}

	const startDrag = (e) => {
		// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
		e.preventDefault()
		dragDisabled = false
	}

	const stopDrag = (e) => {
		e.preventDefault()
		dragDisabled = true
	}

	const handleKeyDown = (e) => {
		if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false
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

<div transition:fade={{ duration: ANIMATION_DURATION }}>
	<h2 class="text-lg text-gray-500 dark:text-white font-semibold capitalize">
		<InPlaceInput on:titleChange id={bookmarks.id} title={bookmarks.title} /> - {bookmarks.children
			.length} tabs
	</h2>
	<button class="text-sm" on:click={dispatch('openAllTabs', bookmarks.id)}>Open All</button>
	<section class="text-gray-500 text-lg dark:text-gray-400 w-full sm:w-4/6">
		<ul
			use:dndzone={{
				items: bookmarks.children,
				dragDisabled: dragDisabled || $dndFreeze,
				flipDurationMs: ANIMATION_DURATION,
			}}
			on:consider={handleDndConsider}
			on:finalize={handleDndFinalize}
			class="space-y-4"
			use:autoAnimate={{ duration: ANIMATION_DURATION }}
		>
			{#each bookmarks.children as bookmark (bookmark.id)}
				<!-- <Bookmark {bookmark} on:openBookmark on:removeBookmark />
				 -->
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
							<button class="w-4 opacity-0" on:click={dispatch('removeBookmark', bookmark)}>
								<i class="fas fa-xmark fa-lg text-gray-400" />
							</button>
							<button
								class="h-9 aspect-square"
								tabindex={dragDisabled ? 0 : -1}
								aria-label="drag-handle"
								class:cursor-grab={dragDisabled && !$dndFreeze}
								class:cursor-grabbing={!dragDisabled}
								class:cursor-not-allowed={$dndFreeze}
								on:mousedown={startDrag}
								on:mouseup={stopDrag}
								on:touchstart={startDrag}
								on:keydown={handleKeyDown}
							>
								<img class="w-full" src={bookmark.favicon} alt="favicon" />
							</button>

							<div class="overflow-hidden">
								<a
									class="text-gray-900 dark:text-gray-300 block whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-lg capitalize font-medium leading-tight"
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
				</div>
			{/each}
		</ul>
	</section>
</div>

<style lang="postcss">
	li:hover button {
		@apply opacity-100;
	}
</style>
