// https://stackoverflow.com/questions/76031247/use-variable-from-static-js-file-in-a-sveltekit-component
export default function removeHashFromSvelteKitEntryFiles(config) {
	console.log('Removing hashes from entry file names')
	return {
		name: 'remove-hash-from-sveltekit-entry-files',
		apply: 'build',
		enforce: 'post',
		config(config) {
			config.build.rollupOptions.output.entryFileNames =
				config.build.rollupOptions.output.entryFileNames.replace('[hash].', ``)
			return config
		},
	}
}
