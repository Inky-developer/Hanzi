<script lang="ts">
	import type { Dictionary } from '$lib/dictionary/dictionary';
	import DictionaryLink from '$lib/components/DictionaryLink.svelte';

	const { text, dictionary }: { text: string; dictionary: Dictionary } = $props();

	const components = $derived(text.split(/(\p{Script=Han}+)/u));
</script>

{#each components as component, index (index)}
	{@const isHanzi = index % 2 === 1}
	{#if isHanzi}
		<DictionaryLink {dictionary} text={component} />
	{:else}
		{component}
	{/if}
{/each}
