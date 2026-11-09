<script lang="ts">
	import Header from './Header.svelte';
	import './layout.css';
	import { SearchState, setSearchState } from '$lib/dictionary/searchState.svelte';

	let { children, data } = $props();

	setSearchState(new SearchState());
</script>

<div class="flex min-h-screen flex-col">
	<Header dictionary={data.dictionary} />

	<main class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
		{@render children()}
	</main>

	<footer class="px-4 py-8 text-center text-xs text-paper-500 dark:text-paper-400">
		<p>TODO: Attribution</p>
	</footer>
</div>
