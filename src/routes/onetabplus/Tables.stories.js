import Component from './Tables.svelte'
import data from './data.js'

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
export default {
	title: 'Example/Tables',
	component: Component,
	tags: ['autodocs'],
	argTypes: {},
}

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args
export const Primary = {
	args: {
		bookmarks: data,
	},
}

export const NoBookmarks = {
	args: {
		bookmarks: [],
	},
}

export const OneBookmark = {
	args: {
		bookmarks: data.splice(-1),
	},
}

export const TwoFolders = {
	args: {
		bookmarks: data.splice(0, 2),
	},
}
