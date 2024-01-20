<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'

	export let title = ''
	export let id: string

	const dispatch = createEventDispatcher()
	let editing = false
	let original = ''

	onMount(() => (original = title))
	const edit = () => (editing = true)

	const submit = () => {
		if (title !== original) {
			dispatch('titleChange', { id, title })
			original = title
		}
		editing = false
	}

	const cancel = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			e.preventDefault()
			title = original
			editing = false
		}
	}
</script>

{#if editing}
	<form
		on:submit|preventDefault={submit}
		class="inline-block"
	>
		<!-- svelte-ignore a11y-autofocus -->
		<input
			autofocus
			type="text"
			bind:value={title}
			on:blur={submit}
			on:keydown={cancel}
		/>
	</form>
{:else}
	<button
		type="button"
		on:click={edit}
		class="text-left"
	>
		{title}
	</button>
{/if}
