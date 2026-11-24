<script lang="ts">
	import type { PageProps } from './$types';
	import { dictionary } from '$lib/state/dictionaryState.svelte';
	import WordPanel from '$lib/components/WordPanel.svelte';
	import { EMPTY_DICTIONARY } from '$lib/dictionary/dictionary';

	const { params }: PageProps = $props();
	const entry = $derived(dictionary().lookup(params.word));
</script>

<svelte:head>
	<title>Hanzi Dictionary - {params.word}</title>
	<meta name="description" content="Chinese Dictionary" />
</svelte:head>

{#if entry !== null}
	<WordPanel {entry} />
{:else if dictionary() === EMPTY_DICTIONARY}
	Loading...
{:else}
	Cannot find entry
{/if}
