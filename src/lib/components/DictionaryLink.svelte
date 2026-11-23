<script lang="ts">
	import { resolve } from '$app/paths';
	import type { DictEntry } from '$lib/dictionary/types';
	import { dictionary } from '$lib/state/dictionaryState.svelte';

	const { text, current, showRuby }: { text: string; current: DictEntry | null; showRuby?: true } =
		$props();

	const entry = $derived(dictionary().lookup(text));
</script>

{#snippet link(entryText: string)}
	<a
		href={resolve('/dict/[word]', { word: entryText })}
		class="text-ink-600 not-italic underline decoration-ink-600/30 underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-500 dark:text-ink-300 dark:decoration-ink-300/30"
		>{text}</a
	>
{/snippet}

{#if entry !== null && entry !== current}
	{#if showRuby && entry.pinyins}
		<ruby>
			{@render link(entry.text)}
			<rp>(</rp>
			<rt
				class="pb-0.5 font-sans text-sm font-normal tracking-wide text-paper-700 dark:text-paper-300"
				>{entry.pinyins[0]}</rt
			>
			<rp>)</rp>
		</ruby>
	{:else}
		{@render link(entry.text)}
	{/if}
{:else}
	<span class="not-italic">{text}</span>
{/if}
