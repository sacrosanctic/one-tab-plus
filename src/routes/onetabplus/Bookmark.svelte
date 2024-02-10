<script lang="ts">
	import type { BookmarkType } from '$lib/types'
	import { getFavicon, openBookmark, removeBookmark } from '$lib/utils'

	let { bookmark, onUpdate } = $props<{ bookmark: BookmarkType; onUpdate: () => void }>()

	const formatDate = (date: number | undefined) => {
		if (!date) return 'no date'

		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		}).format(new Date(date))
	}
</script>

<li
	class="cursor-default"
	data-id={bookmark.id}
>
	{#if bookmark.url === ''}
		<div
			class="flex items-center gap-2 rounded-md p-2 bg-white dark:bg-inherit dark:border-gray-300 dark:border"
		>
			<div class="ml-1 w-4" />
			<i class="fas fa-xmark h-11 fa-3x aspect-square text-red-200" />
			<div
				class="text-gray-900 dark:text-gray-300 block whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-lg capitalize font-medium leading-tight"
			>
				invalid bookmark
			</div>
		</div>
	{:else}
		<div
			title={bookmark.url}
			class="flex items-center gap-2 rounded-md p-2 bg-white dark:border-gray-300 dark:bg-inherit dark:border"
		>
			<button
				class="w-4 opacity-0"
				on:click={() => removeBookmark(bookmark).then(onUpdate)}
			>
				<i class="fas fa-xmark fa-lg text-gray-400" />
			</button>
			<button
				class="h-9 aspect-square my-handle"
				aria-label="drag-handle"
			>
				<img
					class="w-full"
					src={getFavicon(bookmark.url!)}
					alt="favicon"
				/>
			</button>

			<div class="overflow-hidden">
				<a
					class="text-gray-900 dark:text-gray-300 block whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-lg capitalize font-medium leading-tight"
					href={bookmark.url}
					onclick={(e) => {
						e.preventDefault()
						openBookmark(bookmark).then(onUpdate)
					}}
				>
					{bookmark.title}
				</a>
				<p class="font-medium text-xs mt-1">
					<i class="far fa-calendar mr-1" />
					{formatDate(bookmark.dateAdded)}
				</p>
			</div>
		</div>
	{/if}
</li>

<style lang="postcss">
	li:hover button {
		@apply opacity-100;
	}
</style>
