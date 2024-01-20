<script lang="ts">
	import { APP_NAME } from '$lib/constants'
	import { openTabList, saveAllTabs } from '$lib/utils'

	import BookmarkGroup from './BookmarkGroup.svelte'

	export let data
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<main class="m-2">
	<button
		type="button"
		class="btn"
		on:click={saveAllTabs}>get all tabs</button
	>
	<button
		class="btn"
		type="button"
		on:click={openTabList}
	>
		<i class="fas fa-up-right-from-square" />
	</button>
	<button
		class="btn"
		type="button"
	>
		<i class="fas fa-arrow-down-long" />
		<i class="fas fa-calendar" />
	</button>
	<button
		class="btn"
		type="button"
	>
		<i class="fas fa-arrow-up-long" />
		<i class="fas fa-calendar" />
	</button>
	<button
		class="btn"
		type="button"
	>
		<i class="fas fa-arrow-down-long" />
		<i class="fas fa-house" />
	</button>
	<button
		class="btn"
		type="button"
	>
		<i class="fas fa-filter-circle-xmark" />
	</button>
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-200">
		{APP_NAME} tabs
	</h2>
	<div class="grid grid-cols-2 gap-2">
		<div>
			{#each data.bookmarks.other as bookmarks (bookmarks.id)}
				<BookmarkGroup {bookmarks} />
			{/each}
		</div>
		<div class="space-y-2">
			{#each data.bookmarks.intake as bookmarks (bookmarks.id)}
				<BookmarkGroup {bookmarks} />
			{/each}
			{#each data.bookmarks.youtube as bookmarks (bookmarks.id)}
				<BookmarkGroup {bookmarks} />
			{/each}
		</div>
	</div>
</main>
