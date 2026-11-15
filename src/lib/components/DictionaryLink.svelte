<script lang="ts">
	import type { Dictionary } from '$lib/dictionary/dictionary';
	import { resolve } from '$app/paths';

	const { dictionary, text }: { dictionary: Dictionary; text: string } = $props();
</script>

{#if dictionary.lookup(text) !== null}
	<a
		href={resolve('/dict/[word]', { word: text })}
		class="text-ink-600 not-italic underline decoration-ink-600/30 underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-500 dark:text-ink-300 dark:decoration-ink-300/30"
		>{text}</a
	>
{:else}
	<span class="not-italic">{text}</span>
{/if}
