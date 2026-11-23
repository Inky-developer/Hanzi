<script lang="ts">
	import DictionaryLink from '$lib/components/DictionaryLink.svelte';
	import type { DictEntry } from '$lib/dictionary/types';
	import { segmentText } from '$lib/dictionary/segmentation';
	import { dictionary } from '$lib/state/dictionaryState.svelte';

	const { text, current }: { text: string; current: DictEntry | null } = $props();

	const components = $derived(text.split(/(\p{Script=Han}+)/u));
</script>

{#each components as component, index (index)}
	{@const isHanzi = index % 2 === 1}
	{#if isHanzi}
		{@const allowSingleToken = dictionary().lookup(component) !== current}
		{@const segments = segmentText(dictionary(), component, { allowSingleToken })}
		<span class="flex gap-2">
			{#each segments as segment, segmentIndex (segmentIndex)}
				<DictionaryLink text={segment} {current} />
			{/each}
		</span>
	{:else}
		{component}
	{/if}
{/each}
