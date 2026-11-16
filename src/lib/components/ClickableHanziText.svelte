<script lang="ts">
	import DictionaryLink from '$lib/components/DictionaryLink.svelte';
	import type { DictEntry } from '$lib/dictionary/types';

	const { text, current }: { text: string; current: DictEntry | null } = $props();

	const components = $derived(text.split(/(\p{Script=Han}+)/u));
</script>

{#each components as component, index (index)}
	{@const isHanzi = index % 2 === 1}
	{#if isHanzi}
		<DictionaryLink text={component} {current} />
	{:else}
		{component}
	{/if}
{/each}
