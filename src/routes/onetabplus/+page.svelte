<script lang="ts">
	import { ANIMATION_DURATION, APP_NAME } from '$lib/constant'
	import autoAnimate from '@formkit/auto-animate'
	import {
		moveBookmark,
		openAllTabs,
		openBookmark,
		openTabList,
		removeBookmark,
		saveAllTabs,
		updateTitle,
	} from '$lib/util'

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
	<div
		class="space-y-2"
		use:autoAnimate={{ duration: ANIMATION_DURATION }}
	>
		{#each data.bookmarks as bookmarks (bookmarks.id)}
			<div>
				<BookmarkGroup
					{bookmarks}
					on:titleChange={(e) => updateTitle(e.detail)}
					on:openBookmark={(e) => openBookmark(e.detail)}
					on:removeBookmark={(e) => removeBookmark(e.detail)}
					on:moveBookmark={(e) => moveBookmark(...e.detail)}
					on:openAllTabs={(e) => openAllTabs(e.detail)}
				/>
			</div>
		{/each}
	</div>
</main>
