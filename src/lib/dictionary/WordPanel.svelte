<script lang="ts">
	import { type DictEntry } from '$lib/dictionary/types';
	import Hanzi from '$lib/dictionary/Hanzi.svelte';
	import DictionarySection from '$lib/components/DictionarySection.svelte';
	import ClickableHanziText from '$lib/components/ClickableHanziText.svelte';
	import SeparatedList from '$lib/components/SeparatedList.svelte';
	import DictionaryLink from '$lib/components/DictionaryLink.svelte';
	import Speaker from '$lib/components/Speaker.svelte';

	const { entry }: { entry: DictEntry } = $props();

	const hanzis = $derived(Array.from(entry.item.text));
</script>

<article class="flex min-h-0 flex-col">
	<header class="border-b border-paper-100 px-6 py-4 dark:border-paper-800">
		<div class="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
			{#each hanzis as hanzi, index (index)}
				<Hanzi char={hanzi} />
			{/each}
		</div>
	</header>

	<div
		class="scroll-thin flex min-h-0 flex-1 flex-row flex-wrap justify-between gap-5 overflow-y-auto px-6 py-4"
	>
		<DictionarySection title="Simplified">
			<span class="flex flex-row items-center gap-1">
				{#each Array.from(entry.item.text) as char, index (index)}
					<DictionaryLink text={char} current={entry} />
				{/each}
				<Speaker text={entry.item.text} class="pl-2" />
			</span>
		</DictionarySection>

		{#if entry.item.traditional.length > 0}
			<DictionarySection title="Traditional">
				<SeparatedList items={entry.item.traditional}>
					{#snippet item(traditional)}
						<span class="row flex items-center gap-1">
							{#each Array.from(traditional) as char, index (index)}
								<DictionaryLink text={char} current={entry} />
							{/each}
						</span>
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

		{#if entry.item.variantOf.length > 0}
			<DictionarySection title="Variant of">
				<SeparatedList items={entry.item.variantOf}>
					{#snippet item(variant)}
						<ClickableHanziText text={variant} current={entry} />
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.item.countingWords.length > 0}
			{@const title = entry.item.countingWords.length === 1 ? 'Counting word' : 'Counting words'}
			<DictionarySection {title}>
				<SeparatedList items={entry.item.countingWords}>
					{#snippet item(word)}
						<ClickableHanziText text={word} current={entry} />
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.item.english.length > 0}
			<DictionarySection title="Meanings">
				<SeparatedList items={entry.item.english} lang="en" class="font-serif italic">
					{#snippet item(english)}
						<ClickableHanziText text={english} current={entry} />
					{/snippet}
				</SeparatedList>
			</DictionarySection>
		{/if}

		{#if entry.type === 'hanzi' && entry.item.characterHint.length > 0}
			<DictionarySection title="Glossary">
				<ClickableHanziText text={entry.item.characterHint} current={entry} />
			</DictionarySection>
		{/if}

		{#if entry.item.hskLevel !== null}
			<DictionarySection title="HSK level">
				{entry.item.hskLevel}
			</DictionarySection>
		{/if}
	</div>
</article>
