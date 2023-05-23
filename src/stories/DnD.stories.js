import Component from './DnD.svelte'

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
export default {
	title: 'Example/DnD',
	component: Component,
	tags: ['autodocs'],
	argTypes: {},
}

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args
export const Overview = {
	args: {},
}
