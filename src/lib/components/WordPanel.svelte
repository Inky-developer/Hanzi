<script lang="ts">
	import { type DictEntry } from '$lib/dictionary/types';
	import Hanzi from '$lib/components/Hanzi.svelte';
	import DictionarySection from '$lib/components/DictionarySection.svelte';
	import ClickableHanziText from '$lib/components/ClickableHanziText.svelte';
	import SeparatedList from '$lib/components/SeparatedList.svelte';
	import Speaker from '$lib/components/Speaker.svelte';

	const { entry }: { entry: DictEntry } = $props();

	const hanzis = $derived(Array.from(entry.text));
</script>

<article class="flex min-h-0 flex-col">
	<header class="border-b border-paper-100 px-6 py-4 dark:border-paper-800">
		<div class="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
			{#each hanzis as hanzi, index (`${entry.text}\0${index}`)}
				<Hanzi char={hanzi} />
			{/each}
		</div>
	</header>

	<div
		class="scroll-thin flex min-h-0 flex-1 flex-row flex-wrap justify-between gap-5 overflow-y-auto px-6 py-4"
	>
		<DictionarySection title="Simplified">
			<span class="flex flex-row items-center gap-1">
				<ClickableHanziText text={entry.text} current={entry} />
				<Speaker text={entry.text} class="pl-2" />
			</span>
		</DictionarySection>

		{#if entry.traditional}
			<DictionarySection title="Traditional">
				<SeparatedList items={entry.traditional}>
					{#snippet item(traditional)}
						<span class="inline-flex items-center gap-1">
							<ClickableHanziText text={traditional} current={entry} />
						</span>
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.pinyins}
			<DictionarySection title="Pinyin">
				<SeparatedList items={entry.pinyins}>
					{#snippet item(pinyin)}
						{pinyin}
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.variantOf}
			<DictionarySection title="Variant of">
				<SeparatedList items={entry.variantOf}>
					{#snippet item(variant)}
						<ClickableHanziText text={variant} current={entry} />
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.countingWords}
			{@const title = entry.countingWords.length === 1 ? 'Counting word' : 'Counting words'}
			<DictionarySection {title}>
				<SeparatedList items={entry.countingWords}>
					{#snippet item(word)}
						<ClickableHanziText text={word} current={entry} />
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.english}
			<DictionarySection title="Meanings">
				<SeparatedList items={entry.english} lang="en" class="font-serif italic">
					{#snippet item(english)}
						<ClickableHanziText text={english} current={entry} />
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.type === 'hanzi' && entry.characterHint.length > 0}
			<DictionarySection title="Glossary">
				<ClickableHanziText text={entry.characterHint} current={entry} />
			</DictionarySection>
		{/if}

		{#if entry.hskLevel !== undefined}
			<DictionarySection title="HSK level">
				{entry.hskLevel}
			</DictionarySection>
		{/if}
	</div>
</article>
