<script>
	import { flip } from 'svelte/animate'
	import { SHADOW_ITEM_MARKER_PROPERTY_NAME, dndzone } from 'svelte-dnd-action'
	let items = [
		{ id: 1, name: 'item1' },
		{ id: 2, name: 'item2' },
		{ id: 3, name: 'item3' },
		{ id: 4, name: 'item4' },
	]
	let items2 = []
	const flipDurationMs = 300
	function handleDndConsider(e) {
		items = e.detail.items
	}
	function handleDndFinalize(e) {
		items = e.detail.items
	}
	function handleDndConsider2(e) {
		console.log(e)
		items2 = e.detail.items
	}
	function handleDndFinalize2(e) {
		items2 = e.detail.items
	}
</script>

<section
	use:dndzone={{ items, flipDurationMs }}
	on:consider={handleDndConsider}
	on:finalize={handleDndFinalize}
	class="w-1/2 border"
>
	{#each items as item (item.id)}
		<div animate:flip={{ duration: flipDurationMs }} class="border p-1 m-1">{item.name}</div>
	{/each}
</section>
<section
	use:dndzone={{ items: items2, flipDurationMs }}
	on:consider={handleDndConsider2}
	on:finalize={handleDndFinalize2}
	class="w-1/2 border min-h-[2rem]"
>
	{#each items2 as item (item.id)}
		<div animate:flip={{ duration: flipDurationMs }} class="border p-1 m-1">
			{item.name}
		</div>
	{/each}
</section>
