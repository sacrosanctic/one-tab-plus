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
	<tr>
		<td> invalid bookmark </td>
	</tr>
{:else}
	<tr title={bookmark.url} transition:fade>
		<td class="whitespace-nowrap w-[0.1%]">
			<button on:click={dispatch('removeBookmark', bookmark)}>
				<i id="close-button" class="fas fa-xmark fa-fw fa-lg text-gray-400 opacity-0" />
			</button>
		</td>
		<td class="w-6"><img src={bookmark.favicon} alt="favicon" /></td>
		<td class="max-w-lg px-2">
			<a
				class="block text-ellipsis whitespace-nowrap overflow-hidden w-fit"
				href={bookmark.url}
				on:click|preventDefault={dispatch('openBookmark', bookmark)}
				target="_blank"
			>
				{bookmark.title}
			</a>
		</td>
		<td class="text-gray-400 w-44">
			{formatDate(bookmark.dateAdded)}
		</td>
	</tr>
{/if}

<style>
	tr:hover #close-button {
		@apply opacity-100;
	}
</style>
