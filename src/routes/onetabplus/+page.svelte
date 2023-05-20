<script>
	import { APP_NAME } from '$lib/constant'
	import { getAppFolderId, isFolder } from '$lib/util'
	import { andThen, filter, forEach, map, pipe, pluck } from 'ramda'
	import { onMount } from 'svelte'
	import { allP } from 'ramda-adjunct'

	let worms = []
	const setWorms = (data) => (worms = data)

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
			andThen(
				pipe(
					//
					filter(isFolder),
					map(async (obj) => {
						obj.children = await chrome.bookmarks.getChildren(obj.id)
						return obj
					}),
					allP,
				),
			),
			andThen(setWorms),
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
		const parentId = await getAppFolderId()

		for (const { title, url } of allTabs) {
			await chrome.bookmarks.create({ title, url, parentId })
		}
		chrome.tabs.remove(allTabs.map((tab) => tab.id))
	}

	const saveAllTabs2 = async () => {
		let allTabs = await chrome.tabs.query({
			currentWindow: true,
			pinned: false,
			windowType: 'normal',
		})
		const extensionUrl = chrome.runtime.getURL('/')

		allTabs = allTabs.filter((tab) => !tab.url.startsWith(extensionUrl))
		allTabs = allTabs.sort((a, b) => b.index - a.index)

		const date = Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		}).format(new Date())

		const bookmark = await chrome.bookmarks.create({
			title: date,
			parentId: await getAppFolderId(),
		})
		const parentId = bookmark.id

		for (const { title, url } of allTabs) {
			await chrome.bookmarks.create({ title, url, parentId })
		}
		chrome.tabs.remove(pluck('id', allTabs))
	}

	const formatDate = (date) =>
		new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		}).format(new Date(date))

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
	<button class="btn btn-primary" on:click={saveAllTabs2}>save all tabs (w/ folders)</button>
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
		{APP_NAME} - {worms.length} tabs
	</h2>
	{#each worms as { children, title }, i (i)}
		<h2 class=" text-lg text-gray-900 dark:text-white mb-2 font-semibold">{title}</h2>
		<table class="ml-2 space-y-1 text-gray-500 text-lg dark:text-gray-400 w-1/2">
			<tbody>
				{#each children as bookmark, i2 (i2)}
					<!-- <pre>{JSON.stringify(bookmark, null, 2)}</pre> -->
					<tr title={bookmark.url}>
						<td class="whitespace-nowrap w-[0.1%]">
							<button on:click={removeBookmark(bookmark.id)}>
								<i class="fas fa-xmark fa-fw fa-lg text-gray-400" />
							</button>
						</td>
						<td class="w-6"><img src={getFavicon(bookmark.url)} alt="favicon" /></td>
						<td class="max-w-lg px-2">
							<a
								class="block text-ellipsis whitespace-nowrap overflow-hidden w-fit"
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
	{/each}
</main>
