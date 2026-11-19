<script lang="ts">
	import { resolve } from '$app/paths';
	import type { DictEntry } from '$lib/dictionary/types';
	import { dictionary } from '$lib/state/dictionaryState.svelte';

	const { text, current }: { text: string; current: DictEntry | null } = $props();

	const entry = $derived(dictionary().lookup(text));
</script>

{#if entry !== null && entry !== current}
	<a
		href={resolve('/dict/[word]', { word: entry.text })}
		class="text-ink-600 not-italic underline decoration-ink-600/30 underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-500 dark:text-ink-300 dark:decoration-ink-300/30"
		>{text}</a
	>
{:else}
	<span class="not-italic">{text}</span>
{/if}
