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

{#snippet labeledHanziList(label: string, items: string[])}
	<div class="flex flex-wrap items-baseline gap-x-1.5">
		<span class="font-sans text-xs text-paper-500 dark:text-paper-400">{label}</span>
		<SeparatedList {items}>
			{#snippet item(text)}
				<ClickableHanziText {text} current={entry} />
			{/snippet}
		</SeparatedList>
	</div>
{/snippet}

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

		{#if entry.hskLevel !== undefined}
			<DictionarySection title="HSK level">
				{entry.hskLevel}
			</DictionarySection>
		{/if}

		{#if entry.meanings}
			<DictionarySection title="Meanings" fullWidth>
				<ol class="flex flex-col gap-3">
					{#each entry.meanings as meaning, index (index)}
						<li class="flex flex-col gap-0.5">
							{#if meaning.pinyin !== null}
								<span
									class="font-sans text-sm font-medium tracking-wide text-paper-900 dark:text-paper-100"
								>
									{meaning.pinyin}
								</span>
							{/if}
							{#if meaning.english}
								<SeparatedList items={meaning.english} lang="en" class="italic">
									{#snippet item(english)}
										<ClickableHanziText text={english} current={entry} />
									{/snippet}
								</SeparatedList>
							{/if}
							{#if meaning.variantOf}
								{@render labeledHanziList('Variant of', meaning.variantOf)}
							{/if}
							{#if meaning.countingWords}
								{@const label =
									meaning.countingWords.length === 1 ? 'Counting word' : 'Counting words'}
								{@render labeledHanziList(label, meaning.countingWords)}
							{/if}
						</li>
					{/each}
				</ol>
			</DictionarySection>
		{/if}

		{#if entry.type === 'hanzi' && entry.characterHint.length > 0}
			<DictionarySection title="Glossary" fullWidth>
				<ClickableHanziText text={entry.characterHint} current={entry} />
			</DictionarySection>
		{/if}
	</div>
</article>
