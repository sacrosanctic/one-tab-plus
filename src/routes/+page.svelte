<script>
	import { onMount } from 'svelte'

	let bookmarks, runtime
	const appName = 'oneTabSuper'
	const secretFolder = `${appName} (Do Not Touch!)`
	let worms = []
	let search = ''

	const isFolder = (node) => node.url === undefined

	const addBookmark = async () => {
		const test1 = await bookmarks.create({ title: 'home town', url: 'https://google2.com' })
	}

	const seeTree = async () => {
		const asdf = await bookmarks.getTree()
		worms = asdf
		console.log(asdf)
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
	const getUrl = (u) => {
		const url = new URL(chrome.runtime.getURL('/_favicon/'))
		url.searchParams.set('pageUrl', u)
		url.searchParams.set('size', '24')
		return url.toString()
	}
	const loadBookmarks = async () => {
		const nodes = await bookmarks.search({ title: secretFolder })
		if (nodes.length === 0) {
			//create folder
			return
		}
		const myFolder = nodes[0]
		if (!isFolder(myFolder)) return
		worms = await bookmarks.getChildren(myFolder.id)
	}

	onMount(async () => {
		;({ bookmarks, runtime } = chrome)

		loadBookmarks()
		bookmarks.onCreated.addListener(loadBookmarks)
		bookmarks.onChanged.addListener(loadBookmarks)
		bookmarks.onChildrenReordered.addListener(loadBookmarks)
		bookmarks.onMoved.addListener(loadBookmarks)
		bookmarks.onRemoved.addListener(loadBookmarks)
	})
</script>

<!-- <div class="form-control">
	<button class="btn" on:click={seeTree}>seeTree</button>
	<button class="btn" on:click={addBookmark}>add bookmark</button>
	<div class="input-group">
		<input class="input input-bordered" type="text" bind:value={search} />
		<button class="btn" on:click={findBookmark}>find bookmark</button>
	</div>
</div> -->
<main class="m-2">
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Scott's Bookmark Thing</h2>
	<ul class="pl-4 max-w-md space-y-1 text-gray-500 dark:text-gray-400 text-lg">
		{#each worms as bookmark, i (i)}
			<!-- <pre>{JSON.stringify(bookmark, null, 2)}</pre> -->
			<li>
				<a href={bookmark.url} on:click={removeBookmark(bookmark.id)} target="_blank"
					><img class="inline" src={getUrl(bookmark.url)} alt="favicon" /> {bookmark.title}
				</a>
			</li>
		{/each}
	</ul>
</main>
