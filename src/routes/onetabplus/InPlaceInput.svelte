<script lang="ts">
	let { onChange, value } = $props<{
		value: string
		onChange: (value: string) => void
	}>()

	let original = value
</script>

<input
	type="text"
	class="bg-transparent"
	bind:value
	on:blur={() => {
		if (value === original) return

		onChange(value)
		original = value
	}}
	onkeydown={(e) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			e.currentTarget.blur()
		}

		if (e.key === 'Escape') {
			e.preventDefault()
			value = original
		}
	}}
/>
