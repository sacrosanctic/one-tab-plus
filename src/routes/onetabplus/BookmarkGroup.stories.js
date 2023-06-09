import { faker } from '@faker-js/faker'
import Component from './BookmarkGroup.svelte'

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
export default {
	title: 'component/BookmarkGroup',
	component: Component,
	tags: ['autodocs'],
	argTypes: {},
}

export const NoBookmarks = {
	args: {
		bookmarks: {},
	},
}

export const OneBookmark = {
	args: {
		bookmarks: {
			dateAdded: 1684573189599,
			dateGroupModified: 1684573189601,
			id: '40',
			index: 4,
			parentId: '7',
			title: faker.lorem.words(2),
			children: [
				{
					dateAdded: 1684573189601,
					id: '42',
					index: 0,
					parentId: '40',
					title: faker.lorem.words(2),
					url: 'chrome://newtab/',
					favicon: '/favicon.png',
				},
			],
		},
	},
}

export const TwoBookmark = {
	args: {
		bookmarks: {
			dateAdded: 1684573189599,
			dateGroupModified: 1684573189601,
			id: '40',
			index: 4,
			parentId: '7',
			title: faker.lorem.words(2),
			children: [
				{
					dateAdded: 1684573189601,
					id: '41',
					index: 0,
					parentId: '40',
					title: faker.lorem.words(2),
					url: 'chrome://newtab/',
					favicon: '/favicon.png',
				},
				{
					dateAdded: 1684573189601,
					id: '42',
					index: 0,
					parentId: '40',
					title: faker.lorem.words(2),
					url: 'chrome://newtab/',
					favicon: '/favicon.png',
				},
			],
		},
	},
}

export const LongName = {
	args: {
		bookmarks: {
			dateAdded: 1684573189599,
			dateGroupModified: 1684573189601,
			id: '40',
			index: 4,
			parentId: '7',
			title: faker.lorem.lines(4),
			children: [
				{
					dateAdded: 1684573189601,
					id: '41',
					index: 0,
					parentId: '40',
					title: faker.lorem.lines(4),
					url: 'chrome://newtab/',
					favicon: '/favicon.png',
				},
			],
		},
	},
}

export const MissingFavicon = {
	args: {
		bookmarks: {
			dateAdded: 1684573189599,
			dateGroupModified: 1684573189601,
			id: '40',
			index: 4,
			parentId: '7',
			title: 'not interesting title',
			children: [
				{
					dateAdded: 1684573189601,
					id: '41',
					index: 0,
					parentId: '40',
					title: faker.lorem.words(8),
					url: 'chrome://newtab/',
					favicon: '/favicon.png',
				},
			],
		},
	},
}
