import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import removeHashFromSvelteKitEntryFiles from './remove-hash-from-entry'
import { fileURLToPath } from 'url'

export default defineConfig({
	plugins: [sveltekit(), removeHashFromSvelteKitEntryFiles()],
	build: {
		rollupOptions: {
			input: {
				background: fileURLToPath(new URL('./src/lib/background.js', import.meta.url)),
			},
		},
	},
})
