<script>
	import { APP_NAME } from '$lib/constant'
	import { getAppFolderId, isFolder } from '$lib/util'
	import {
		andThen,
		assoc,
		converge,
		filter,
		forEach,
		identity,
		map,
		pipe,
		pluck,
		prop,
		reduce,
		tap,
	} from 'ramda'
	import { onMount } from 'svelte'
	import Tables from './Tables.svelte'

	let worms = []
	const resetWorms = () => (worms = [])
	const updateWorms = (data) => (worms = [...worms, data])

	const removeBookmark = ({ id }) => {
		chrome.bookmarks.remove(id)
		loadBookmarks()
	}

	const openBookmark = async ({ url, id, parentId }) => {
		chrome.tabs.create({ active: false, url })
		chrome.bookmarks.remove(id)
		if ((await chrome.bookmarks.getChildren(parentId)).length === 0)
			chrome.bookmarks.remove(parentId)
		loadBookmarks()
	}

	const getFavicon = (u) => {
		const url = new URL(chrome.runtime.getURL('/_favicon/'))
		url.searchParams.set('pageUrl', u)
		url.searchParams.set('size', '36')
		return url.toString()
	}

	const loadBookmarks = () =>
		pipe(
			tap(resetWorms),
			getAppFolderId,
			andThen(chrome.bookmarks.getChildren),
			andThen(
				pipe(
					//
					filter(isFolder),
					forEach(async (folder) => {
						folder.children = await chrome.bookmarks.getChildren(folder.id)
						folder.children = map(
							converge(
								//
								assoc('favicon'),
								[pipe(prop('url'), getFavicon), identity],
							),
							folder.children,
						)
						updateWorms(folder)
					}),
				),
			),
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
			index: 0,
		})
		const parentId = bookmark.id

		for (const { title, url } of allTabs) {
			await chrome.bookmarks.create({ title, url, parentId, index: 0 })
		}
		chrome.tabs.remove(pluck('id', allTabs))
	}

	const addBookmarkListeners = () =>
		forEach(
			(event) => chrome.bookmarks[event].addListener(loadBookmarks),
			['onCreated', 'onChanged', 'onMoved', 'onRemoved', 'onChildrenReordered'],
		)
	$: numOfTabs = reduce((acc, elm) => acc + elm.children.length, 0)(worms)

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
		{APP_NAME} - {numOfTabs} tabs
	</h2>
	<Tables
		bind:bookmarks={worms}
		on:openBookmark={(e) => openBookmark(e.detail)}
		on:removeBookmark={(e) => removeBookmark(e.detail)}
	/>
</main>
