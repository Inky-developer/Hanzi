<script lang="ts">
	import type { Dictionary } from '$lib/dictionary/dictionary';
	import Search from '$lib/dictionary/Search.svelte';
	import WordPanel from '$lib/dictionary/WordPanel.svelte';
	import type { DictEntry } from '$lib/dictionary/types';
	import { asset } from '$app/paths';

	const { dictionary, entry }: { dictionary: Dictionary; entry: DictEntry | null } = $props();
</script>

<div
	class="flex w-full flex-col overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 shadow-black/5 ring-paper-200/80 backdrop-blur-sm md:min-h-120 md:flex-row dark:bg-white/5 dark:shadow-black/40 dark:ring-paper-800"
>
	<div
		class="flex min-h-0 w-72 shrink-0 flex-col border-r border-paper-200 contain-size not-md:hidden dark:border-paper-800"
	>
		<Search {dictionary} selected={entry} />
	</div>

	<div class="flex min-h-0 flex-1 flex-col">
		{#if entry !== null}
			<WordPanel {dictionary} {entry} />
		{:else}
			<div class="grid flex-1 place-items-center px-6 py-14 text-paper-500 dark:text-paper-400">
				<div class="max-w-xs text-center">
					<img src={asset('/icon.svg')} alt="app icon" class="mx-auto mb-4 size-16" />
					<p class="font-serif text-lg text-paper-700 dark:text-paper-200">Search dictionary</p>
					<p class="mt-1.5 text-sm">Start by searching for a word</p>
				</div>
			</div>
		{/if}
	</div>
</div>
