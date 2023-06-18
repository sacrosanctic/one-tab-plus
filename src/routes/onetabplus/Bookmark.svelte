<script>
	import { isEmpty, isNil } from 'ramda'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let bookmark = {}

	const formatDate = (date) =>
		new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		}).format(new Date(date))
</script>

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
		<img class="h-9 aspect-square" src={bookmark.favicon} alt="favicon" />

		<div class="overflow-hidden">
			<a
				class="text-gray-900 dark:text-gray-300 block whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-lg capitalize font-medium"
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

<style lang="postcss">
	li:hover button {
		@apply opacity-100;
	}
</style>
