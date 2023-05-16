<script>
	import { onMount } from 'svelte'

	let bookmarks, runtime, tabs
	const appName = 'One Tab Plus'
	const secretFolder = `${appName} (Do Not Touch!)`
	let worms = []
	let search = ''

	const isFolder = (node) => node.url === undefined
	const addBookmark = async (title, url) => {
		await bookmarks.create({ title, url })
	}
	const findBookmark = async () => {
		const list = (await bookmarks.search({ title: search })).map((node) => {
			node.isFolder = isFolder(node)
			return node
		})
		worms = list
	}

	const removeBookmark = (id) => {
		bookmarks.remove(id)
		loadBookmarks()
	}

	const openBookmark = (url, id) => {
		tabs.create({ active: false, url })
		removeBookmark(id)
	}

	const getUrl = (u) => {
		const url = new URL(runtime.getURL('/_favicon/'))
		url.searchParams.set('pageUrl', u)
		url.searchParams.set('size', '36')
		return url.toString()
	}

	const getFolderId = async () => {
		const nodes = await bookmarks.search({ title: secretFolder })
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

		let title, url
		for (const tab of allTabs) {
			console.log(tab)
			;({ title, url } = tab)
			await bookmarks.create({ title, url, parentId: await getFolderId() })
		}
		console.log(allTabs)
		tabs.remove(allTabs.map((tab) => tab.id))
	}

	onMount(async () => {
		;({ bookmarks, runtime, tabs } = chrome)

		loadBookmarks()
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
					<td class="w-6"><img src={getUrl(bookmark.url)} alt="favicon" /></td>
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
						{new Intl.DateTimeFormat('en-US', {
							year: 'numeric',
							month: 'numeric',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
						}).format(new Date(bookmark.dateAdded))}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>
