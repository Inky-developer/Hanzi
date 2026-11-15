<script lang="ts">
	import { type DictEntry } from '$lib/dictionary/types';
	import type { Dictionary } from '$lib/dictionary/dictionary';
	import Hanzi from '$lib/dictionary/Hanzi.svelte';
	import DictionarySection from '$lib/components/DictionarySection.svelte';
	import ClickableHanziText from '$lib/components/ClickableHanziText.svelte';
	import SeparatedList from '$lib/components/SeparatedList.svelte';

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

	<div
		class="scroll-thin flex min-h-0 flex-1 flex-row flex-wrap justify-between gap-5 overflow-y-auto px-6 py-4"
	>
		<DictionarySection title="Simplified">
			<ClickableHanziText {dictionary} text={entry.item.text} />
		</DictionarySection>

		{#if entry.item.traditional.length > 0}
			<DictionarySection title="Traditional">
				<SeparatedList items={entry.item.traditional}>
					{#snippet item(traditional)}
						<ClickableHanziText {dictionary} text={traditional} />
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.item.pinyins.length > 0}
			<DictionarySection title="Pinyin">
				<SeparatedList items={entry.item.pinyins}>
					{#snippet item(pinyin)}
						{pinyin}
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.item.english.length > 0}
			<DictionarySection title="Meanings">
				<SeparatedList items={entry.item.english} lang="en" class="font-serif italic">
					{#snippet item(english)}
						<ClickableHanziText text={english} {dictionary} />
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.type === 'hanzi' && (entry.item.characterHint.length > 0 || entry.item.originalMeaning.length > 0)}
			<DictionarySection title="Glossary">
				<ClickableHanziText text={entry.item.characterHint} {dictionary} />
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
