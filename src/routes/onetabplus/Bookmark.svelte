<script>
	import { isEmpty, isNil } from 'ramda'
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'

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
	<li>
		<td> invalid bookmark </td>
	</li>
{:else}
	<li title={bookmark.url} class="flex items-center gap-4 border rounded-md p-4 bg-white">
		<img class="h-11 aspect-square" src={bookmark.favicon} alt="favicon" />

		<div class="overflow-hidden">
			<a
				class="text-black block whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-lg capitalize font-medium leading-none"
				href={bookmark.url}
				on:click|preventDefault={dispatch('openBookmark', bookmark)}
				target="_blank"
			>
				{bookmark.title}
			</a>
			<p class="font-medium text-sm mt-1.5">
				<i class="fa-regular fa-calendar mr-1" />
				{formatDate(bookmark.dateAdded)}
			</p>
		</div>

		<button class="w-12 ml-auto flex-shrink-0" on:click={dispatch('removeBookmark', bookmark)}>
			<i id="close-button" class="fas fa-xmark fa-fw fa-lg text-gray-400" />
		</button>
	</li>
{/if}
