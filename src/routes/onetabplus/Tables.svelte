<script>
	import { createEventDispatcher } from 'svelte'

	export let bookmarks = []
	const dispatch = createEventDispatcher()

	const formatDate = (date) =>
		new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		}).format(new Date(date))
</script>

{#each bookmarks as { children, title }, i (i)}
	<h2 class=" text-lg text-gray-900 dark:text-white mb-2 font-semibold">
		{title} - {children.length} tabs
	</h2>
	<table class="ml-2 space-y-1 text-gray-500 text-lg dark:text-gray-400 w-1/2">
		<tbody>
			{#each children as bookmark, i2 (i2)}
				<!-- <pre>{JSON.stringify(bookmark, null, 2)}</pre> -->
				<tr title={bookmark.url}>
					<td class="whitespace-nowrap w-[0.1%]">
						<button on:click={dispatch('removeBookmark', bookmark)}>
							<i class="fas fa-xmark fa-fw fa-lg text-gray-400" />
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
			{/each}
		</tbody>
	</table>
{/each}
