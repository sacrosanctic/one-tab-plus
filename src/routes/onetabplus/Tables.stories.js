import { last, of, pipe, slice } from 'ramda'
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
export const Overview = {
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
		bookmarks: pipe(last, of(Array))(data),
	},
}

export const TwoFolders = {
	args: {
		bookmarks: slice(0, 3, data),
	},
}
