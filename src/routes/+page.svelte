<script>
	import { onMount } from 'svelte';

	let bookmarks;
	const appName = 'oneTabSuper';
	let worms = [];
	let search = '';
	const secretFolder = `${appName} (Do Not Touch!)`;

	const isFolder = (node) => node.url === undefined;

	const addBookmark = async () => {
		const test1 = await bookmarks.create({ title: 'home town', url: 'https://google2.com' });
	};

	const seeTree = async () => (worms = await bookmarks.getTree());

	const findBookmark = async () => {
		const list = (await bookmarks.search({ title: search })).map((node) => {
			node.isFolder = isFolder(node);
			return node;
		});
		worms = list;
	};

	onMount(async () => {
		({ bookmarks } = chrome);

		worms = (await bookmarks.search({ title: secretFolder })).map((node) => {
			node.isFolder = isFolder(node);
			return node;
		});
	});
</script>

<button on:click={seeTree}>seeTree</button>
<button on:click={addBookmark}>add bookmark</button>
<input type="text" bind:value={search} />
<button on:click={findBookmark}>find bookmark</button>
{#each worms as bookmark, i (i)}
	<pre>{JSON.stringify(bookmark, null, 2)}</pre>
{/each}
