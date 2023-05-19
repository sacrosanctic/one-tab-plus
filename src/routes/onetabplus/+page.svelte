<script>
	import { APP_NAME } from '$lib/contant'
	import { getAppFolderId } from '$lib/util'
	import { andThen, forEach, identity, pipe, prop, sortBy } from 'ramda'
	import { onMount } from 'svelte'

	let worms = []
	const updateBookmarkState = (data) => (worms = data)

	const removeBookmark = (id) => {
		chrome.bookmarks.remove(id)
		loadBookmarks()
	}

	const openBookmark = (url, id) => {
		chrome.tabs.create({ active: false, url })
		removeBookmark(id)
	}

	const getFavicon = (u) => {
		const url = new URL(chrome.runtime.getURL('/_favicon/'))
		url.searchParams.set('pageUrl', u)
		url.searchParams.set('size', '36')
		return url.toString()
	}

	const loadBookmarks = () =>
		pipe(
			getAppFolderId,
			andThen(chrome.bookmarks.getChildren),
			andThen(sortBy(prop('dateAdded'))),
			andThen(updateBookmarkState),
		)()

	const saveAllTabs = async () => {
		let allTabs = await chrome.tabs.query({
			currentWindow: true,
			pinned: false,
			windowType: 'normal',
		})
		const extensionUrl = chrome.runtime.getURL('/')

		allTabs = allTabs.filter((tab) => !tab.url.startsWith(extensionUrl))
		allTabs = allTabs.sort((a, b) => b.index - a.index)
		const parentId = await findAppFolder()

		for (const { title, url } of allTabs) {
			await chrome.bookmarks.create({ title, url, parentId })
		}
		chrome.tabs.remove(allTabs.map((tab) => tab.id))
	}

	const formatDate = (date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		}).format(new Date(date))
	}

	const addBookmarkListeners = () =>
		forEach(
			(event) => chrome.bookmarks[event].addListener(loadBookmarks),
			['onCreated', 'onChanged', 'onMoved', 'onRemoved', 'onChildrenReordered'],
		)

	onMount(async () => {
		loadBookmarks()
		addBookmarkListeners()
	})
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<main class="m-2">
	<button class="btn btn-primary" on:click={saveAllTabs}>get all tabs</button>
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
		{APP_NAME} - {worms.length} tabs
	</h2>
	<table class="ml-2 space-y-1 text-gray-500 text-lg dark:text-gray-400">
		<tbody>
			{#each worms as bookmark, i (i)}
				<!-- <pre>{JSON.stringify(bookmark, null, 2)}</pre> -->
				<tr title={bookmark.url}>
					<td>
						<button on:click={removeBookmark(bookmark.id)}>
							<i class="fas fa-xmark fa-fw fa-lg text-gray-400" />
						</button>
					</td>
					<td class="w-6"><img src={getFavicon(bookmark.url)} alt="favicon" /></td>
					<td class="max-w-lg px-2">
						<a
							class="block text-ellipsis whitespace-nowrap overflow-hidden"
							href={bookmark.url}
							on:click|preventDefault={openBookmark(bookmark.url, bookmark.id)}
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
</main>
