<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Dictionary } from '$lib/dictionary/dictionary';

	const { text, dictionary }: { text: string; dictionary: Dictionary } = $props();

	const components = $derived(text.split(/(\p{Script=Han}+)/u));
</script>

{#each components as component, index (index)}
	{@const isHanzi = index % 2 === 1}
	{#if isHanzi}
		{#if dictionary.lookup(component) !== null}
			<a
				href={resolve('/dict/[word]', { word: component })}
				class="text-ink-600 not-italic underline decoration-ink-600/30 underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-500 dark:text-ink-300 dark:decoration-ink-300/30"
				>{component}</a
			>
		{:else}
			<span class="not-italic">{component}</span>
		{/if}
	{:else}
		{component}
	{/if}
{/each}
