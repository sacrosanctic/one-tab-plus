import Component from './InPlaceInput.svelte'

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
export default {
	title: 'component/InPlaceInput',
	component: Component,
	tags: ['autodocs'],
	argTypes: {},
}

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args
export const InPlaceInput = {
	args: {
		title: 'abc',
	},
}
