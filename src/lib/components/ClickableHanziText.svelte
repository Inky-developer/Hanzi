<script lang="ts">
	import type { Dictionary } from '$lib/dictionary/dictionary';
	import DictionaryLink from '$lib/components/DictionaryLink.svelte';
	import type { DictEntry } from '$lib/dictionary/types';

	const {
		text,
		dictionary,
		current
	}: { text: string; dictionary: Dictionary; current: DictEntry | null } = $props();

	const components = $derived(text.split(/(\p{Script=Han}+)/u));
</script>

{#each components as component, index (index)}
	{@const isHanzi = index % 2 === 1}
	{#if isHanzi}
		<DictionaryLink {dictionary} text={component} {current} />
	{:else}
		{component}
	{/if}
{/each}
