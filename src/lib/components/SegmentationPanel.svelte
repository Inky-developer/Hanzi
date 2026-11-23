<script lang="ts">
	import { segmentText } from '$lib/dictionary/segmentation';
	import { dictionary } from '$lib/state/dictionaryState.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import DictionaryLink from '$lib/components/DictionaryLink.svelte';

	const { text: initialText }: { text: string } = $props();
	// svelte-ignore state_referenced_locally
	let text = $state(initialText);

	let segments: string[] = $derived(segmentText(dictionary(), initialText));
</script>

<article class="flex min-h-0 flex-col gap-3">
	<textarea
		bind:value={text}
		rows="4"
		lang="zh"
		placeholder="Enter chinese text"
		class="w-full resize-y rounded-lg border border-paper-200 bg-white px-3 py-2 font-serif shadow-sm transition outline-none focus:border-ink-500 focus:ring-3 focus:ring-ink-500/30 dark:border-paper-700
     dark:bg-black/20 dark:placeholder:text-paper-400"></textarea>
	<button
		onclick={() => goto(resolve('/segmentation/[text]', { text: encodeURIComponent(text) }))}
		disabled={text.trim().length === 0}
		class="rounded-ld cursor-pointer border border-paper-200 bg-paper-200/70 py-2 shadow-sm transition-colors hover:brightness-150
		disabled:cursor-not-allowed disabled:opacity-50 dark:border-paper-700 dark:bg-black/20"
		>Analyze</button
	>
	{#if segments.length > 0}
		<div
			class="my-4 rounded-md bg-paper-300 p-2 font-serif leading-loose font-medium whitespace-pre-wrap dark:bg-paper-700"
		>
			{#each segments as segment, index (index)}{#if segment.trim().length === 0}{segment}{:else}<span
						class="mx-[0.3em] inline-block"
						><DictionaryLink text={segment} current={null} showRuby /></span
					>{/if}{/each}
		</div>
	{/if}
</article>
