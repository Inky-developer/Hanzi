<script lang="ts">
	import Header from './Header.svelte';
	import './layout.css';
	import { SearchState, setSearchState } from '$lib/dictionary/searchState.svelte';
	import type { LayoutProps } from './$types.js';
	import { setDictionary } from '$lib/dictionary/dictionaryState.svelte';

	let { children, data }: LayoutProps = $props();

	setSearchState(new SearchState());
	$effect(() => {
		data.dictionary?.then((it) => {
			setDictionary(it);
			window.requestIdleCallback(() => {
				it.buildCaches();
			});
		});
	});
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
