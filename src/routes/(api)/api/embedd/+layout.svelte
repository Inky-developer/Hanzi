<script lang="ts">
	import '$lib/theme.css';
	import type { LayoutProps } from './$types';
	import initializeAppState from '$lib/state/initializeAppState.svelte';
	import { resolve } from '$app/paths';
	import BackButton from './BackButton.svelte';

	let { children, data }: LayoutProps = $props();

	const getEntryURL = (word: string) => resolve('/(api)/api/embedd/[word]', { word });
	initializeAppState(() => data.dictionary, getEntryURL);
</script>

<svelte:head>
	<meta name="responsive-embedded-sizing" />
</svelte:head>

<div class="flex flex-col text-paper-800 antialiased dark:text-paper-100">
	<div>
		<BackButton />
	</div>
	{@render children()}
</div>
