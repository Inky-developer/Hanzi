<script lang="ts">
	import type { PageProps } from './$types';
	import Search from '$lib/dictionary/Search.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Hanzi Wörterbuch</title>
	<meta name="description" content="Chinesisches Wörterbuch" />
</svelte:head>

<section class="flex flex-1 flex-col justify-center gap-8">
	<div class="mx-auto max-w-xl text-center">
		<h1
			class="font-serif text-3xl font-semibold text-balance text-paper-900 sm:text-4xl dark:text-paper-50"
		>
			Hanzi
		</h1>
	</div>

	<!--	Dictionary is not loaded during pre-rendering.-->
	<!--	Only show the search once the dictionary has loaded.-->
	{#if data.dictionary}
		<Search dictionary={data.dictionary} selected={null} />
	{:else}
		<div class="w-full text-center">Loading dictionary...</div>
	{/if}
</section>
