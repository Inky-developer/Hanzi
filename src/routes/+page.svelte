<script lang="ts">
	import DictionaryComponent from '$lib/dictionary/Dictionary.svelte';

	let { data } = $props();
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

	<DictionaryComponent data={data.dictionary} />
</section>
