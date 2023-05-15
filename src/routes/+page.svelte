<script>
	let url = '';

	const getUrl = async () => {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		if (tab.url !== null) url = tab.url;
	};
</script>

<button on:click={getUrl}>reveal current url</button>
{#if url}
	<div>
		The current url is: {url}
	</div>
{/if}
