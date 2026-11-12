<script lang="ts">
	import { type DictEntry } from '$lib/dictionary/types';
	import type { Dictionary } from '$lib/dictionary/dictionary';
	import Hanzi from '$lib/dictionary/Hanzi.svelte';
	import DictionarySection from '$lib/components/DictionarySection.svelte';
	import { resolve } from '$app/paths';

	const { entry, dictionary }: { entry: DictEntry; dictionary: Dictionary } = $props();

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
			{#each Array.from(entry.item.text) as char, index (index)}
				<a class="hover:underline" href={resolve('/dict/[word]', { word: char })}>
					{char}
				</a>
			{/each}
		</DictionarySection>

		{#if entry.item.pinyins.length > 0}
			<DictionarySection title="Pinyin">
				<ul class="flex flex-wrap items-baseline gap-x-1.5">
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
				<ul lang="en" class="flex flex-wrap items-baseline gap-x-1.5 font-serif italic">
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

		{#if entry.type === 'hanzi' && (entry.item.characterHint.length > 0 || entry.item.originalMeaning.length > 0)}
			<DictionarySection title="Glossary">
				{entry.item.characterHint}
				<br />
				{#if entry.item.originalMeaning.length > 0}
					Original meaning: {entry.item.originalMeaning}
				{/if}
			</DictionarySection>
		{/if}

		{#if entry.item.hskLevel !== null}
			<DictionarySection title="HSK level">
				{entry.item.hskLevel}
			</DictionarySection>
		{/if}
	</div>
</article>
