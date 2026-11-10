<script lang="ts">
	import type { PageProps } from './$types';
	import DictionaryComponent from '$lib/dictionary/Dictionary.svelte';

	const { params, data }: PageProps = $props();
</script>

<svelte:head>
	<title>Hanzi Dictionary</title>
	<meta name="description" content="Chinese Dictionary" />
</svelte:head>

{#snippet loading()}
	<div class="w-full text-center">Loading dictionary...</div>
{/snippet}
{#if data.dictionary}
	{#await data.dictionary}
		{@render loading()}
	{:then dictionary}
		{@const entry = dictionary.lookup(params.word)}
		<DictionaryComponent {dictionary} {entry} />
	{:catch}
		<div class="w-full text-center">Failed to load data</div>
	{/await}
{:else}
	{@render loading()}
{/if}
