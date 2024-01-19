<script>
	import { createEventDispatcher, onMount } from 'svelte'

	export let title = ''
	export let id

	const dispatch = createEventDispatcher()
	let editing = false,
		original

	onMount(() => (original = title))
	const edit = () => (editing = true)
	const focus = (el) => el.focus()

	const submit = () => {
		if (title !== original) {
			dispatch('titleChange', { id, title })
			original = title
		}
		editing = false
	}

	const cancel = (e) => {
		if (e.key === 'Escape') {
			e.preventDefault()
			title = original
			editing = false
		}
	}
</script>

{#if editing}
	<form on:submit|preventDefault={submit} class="inline-block">
		<input bind:value={title} on:blur={submit} use:focus on:keydown={cancel} />
	</form>
{:else}
	<button type="button" on:click={edit} class="text-left">
		{title}
	</button>
{/if}
