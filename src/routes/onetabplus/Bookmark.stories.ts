import Component from './Bookmark.svelte'
import { faker } from '@faker-js/faker'

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
export default {
	title: 'component/Bookmark',
	component: Component,
	tags: ['autodocs'],
	argTypes: {},
}

export const NoBookmark = {
	args: {
		bookmark: undefined,
	},
}
export const EmptyBookmark = {
	args: {
		bookmark: {},
	},
}

export const OneBookmark = {
	args: {
		bookmark: {
			dateAdded: 1684573189601,
			id: '41',
			index: 0,
			parentId: '40',
			title: faker.lorem.words(3),
			url: 'chrome://newtab/',
			favicon: '/favicon.png',
		},
	},
}
export const LongName = {
	args: {
		bookmark: {
			dateAdded: 1684573189601,
			id: '41',
			index: 0,
			parentId: '40',
			title: faker.lorem.lines(4),
			url: 'chrome://newtab/',
			favicon: '/favicon.png',
		},
	},
}
