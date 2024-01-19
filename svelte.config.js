import adapter from 'sveltekit-adapter-chrome-extension'
import { vitePreprocess } from '@sveltejs/kit/vite'

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter(),
		// chrome extension doesnt play nicely with _ in the filenames
		appDir: 'app',
	},
	preprocess: vitePreprocess(),
}
