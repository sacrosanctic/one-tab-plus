<script>
	import { onMount } from 'svelte'

	let bookmarks, runtime, tabs
	const appName = 'One Tab Plus'
	const appFolderName = `${appName} (Do Not Touch!)`
	let worms = []

	const isFolder = (node) => node.url === undefined

	const removeBookmark = (id) => {
		bookmarks.remove(id)
		loadBookmarks()
	}

	const openBookmark = (url, id) => {
		tabs.create({ active: false, url })
		removeBookmark(id)
	}

	const getFavicon = (u) => {
		const url = new URL(runtime.getURL('/_favicon/'))
		url.searchParams.set('pageUrl', u)
		url.searchParams.set('size', '36')
		return url.toString()
	}

	const getFolderId = async () => {
		const nodes = await bookmarks.search({ title: appFolderName })
		if (nodes.length === 0) {
			//create folder
			return
		}
		const myFolder = nodes[0]
		if (!isFolder(myFolder)) return

		return myFolder.id
	}
	const loadBookmarks = async () => {
		const id = await getFolderId()
		worms = (await bookmarks.getChildren(id)).sort((a, b) => b.dateAdded - a.dateAdded)
	}

	const saveAllTabs = async () => {
		let allTabs = await tabs.query({ currentWindow: true, pinned: false, windowType: 'normal' })
		const extensionUrl = runtime.getURL('/')

		allTabs = allTabs.filter((tab) => !tab.url.startsWith(extensionUrl))
		allTabs = allTabs.sort((a, b) => b.index - a.index)
		const parentId = await getFolderId()

		for (const { title, url } of allTabs) {
			await bookmarks.create({ title, url, parentId })
		}
		tabs.remove(allTabs.map((tab) => tab.id))
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

	onMount(async () => {
		;({ bookmarks, runtime, tabs } = chrome)

		loadBookmarks()

		// add a set of listeners
		// ['onCreated','onChanged','onMoved','onRemoved','onChildrenReordered'].forEach(event => {
		//   bookmarks[event].addListener(loadBookmarks)
		// });

		bookmarks.onCreated.addListener(loadBookmarks)
		bookmarks.onChanged.addListener(loadBookmarks)
		bookmarks.onChildrenReordered.addListener(loadBookmarks)
		bookmarks.onMoved.addListener(loadBookmarks)
		bookmarks.onRemoved.addListener(loadBookmarks)
	})
</script>

<svelte:head>
	<title>{appName}</title>
</svelte:head>

<main class="m-2">
	<button class="btn btn-primary" on:click={saveAllTabs}>get all tabs</button>
	<h2 class="mb-2 text-lg font-semibold text-gray-900">{appName} - {worms.length} tabs</h2>
	<table class="ml-2 space-y-1 text-gray-500 text-lg">
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
