<script>
	import { onMount } from 'svelte'

	let bookmarks, runtime
	const appName = 'One Tab Plus'
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
		url.searchParams.set('size', '36')
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

<svelte:head>
	<title>{appName}</title>
</svelte:head>

<!-- <div class="form-control">
	<button class="btn" on:click={seeTree}>seeTree</button>
	<button class="btn" on:click={addBookmark}>add bookmark</button>
	<div class="input-group">
		<input class="input input-bordered" type="text" bind:value={search} />
		<button class="btn" on:click={findBookmark}>find bookmark</button>
	</div>
</div> -->
<main class="m-2">
	<h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{appName}</h2>
	<ul class="max-w-xl pl-4 space-y-1 text-gray-500 dark:text-gray-400 text-lg">
		{#each worms as bookmark, i (i)}
			<!-- <pre>{JSON.stringify(bookmark, null, 2)}</pre> -->
			<li class="flex gap-2" title={bookmark.url}>
				<a
					class="flex gap-2 items-center"
					href={bookmark.url}
					on:click={removeBookmark(bookmark.id)}
					target="_blank"
					><img class="inline w-6" src={getUrl(bookmark.url)} alt="favicon" />
					<span class="overflow-ellipsis overflow-hidden whitespace-nowrap w-72">
						{bookmark.title}
					</span>
				</a>
				<span class="text-gray-300">
					{new Intl.DateTimeFormat('en-US', {
						year: 'numeric',
						month: 'numeric',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
					}).format(new Date(bookmark.dateAdded))}
				</span>
			</li>
		{/each}
	</ul>
</main>
