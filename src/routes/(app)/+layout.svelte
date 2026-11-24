<script lang="ts">
	import Header from './Header.svelte';
	import '$lib/app.css';
	import type { LayoutProps } from './$types';
	import initializeAppState from '$lib/state/initializeAppState.svelte';
	import { resolve } from '$app/paths';

	let { children, data }: LayoutProps = $props();

	const getEntryURL = (word: string) => resolve('/(app)/dict/[word]', { word });
	initializeAppState(() => data.dictionary, getEntryURL);
</script>

<div class="flex min-h-screen flex-col">
	<Header commonHanzi={data.commonHanzi} />

	<noscript>
		<div class="mx-auto mt-4 size-fit rounded bg-red-950 px-8 py-2 text-paper-100">
			<p class="mx-auto size-fit pb-4 font-bold uppercase">JavaScript is disabled!</p>
			<p>This offline dictionary works by rendering dictionary entries on the client.</p>
			<p>To use it, enable JavaScript.</p>
		</div>
	</noscript>

	<main class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
		{@render children()}
	</main>

	<footer class="px-4 py-8 text-center text-xs text-paper-500 dark:text-paper-400">
		<p>TODO: Attribution</p>
	</footer>
</div>
