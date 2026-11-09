<script lang="ts">
	import { type DictEntry } from '$lib/dictionary/types';
	import type { Dictionary } from '$lib/dictionary/dictionary';
	import Hanzi from '$lib/dictionary/Hanzi.svelte';
	import DictionarySection from '$lib/components/DictionarySection.svelte';

	// eslint-disable-next-line svelte/no-unused-props
	const {
		entry,
		dictionary
	}: { entry: DictEntry; onEntry: (entry: DictEntry) => void; dictionary: Dictionary } = $props();

	const hanzis = $derived(Array.from(entry.item.text));
</script>

<article class="flex min-h-0 flex-col">
	<header class="border-b border-paper-100 px-6 py-4 dark:border-paper-800">
		<div class="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
			{#each hanzis as hanzi, index (index)}
				<Hanzi {dictionary} char={hanzi} />
			{/each}
		</div>
	</header>

	<div class="scroll-thin flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-4">
		<DictionarySection title="Simplified">
			{entry.item.text}
		</DictionarySection>

		{#if entry.item.pinyins.length > 0}
			<DictionarySection title="Pinyin">
				<ul
					class="flex flex-wrap items-baseline gap-x-1.5 font-serif text-paper-700 dark:text-paper-300"
				>
					{#each entry.item.pinyins as pinyin (pinyin)}
						<li
							class="not-first:before:mr-1.5 not-first:before:text-paper-300 not-first:before:content-['·'] dark:not-first:before:text-paper-700"
						>
							{pinyin}
						</li>
					{/each}
				</ul>
			</DictionarySection>
		{/if}

		{#if entry.item.english.length > 0}
			<DictionarySection title="Meanings">
				<ul
					lang="en"
					class="flex flex-wrap items-baseline gap-x-1.5 font-serif text-paper-700 italic dark:text-paper-300"
				>
					{#each entry.item.english as english (english)}
						<li
							class="not-first:before:mr-1.5 not-first:before:text-paper-300 not-first:before:content-['·'] dark:not-first:before:text-paper-700"
						>
							{english}
						</li>
					{/each}
				</ul>
			</DictionarySection>
		{/if}
	</div>
</article>
