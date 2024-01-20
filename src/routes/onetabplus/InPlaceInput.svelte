<script lang="ts">
	let { onChange, title: value } = $props<{
		title: string
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
		if (e.key !== 'Escape') return

		e.preventDefault()
		value = original
	}}
/>
