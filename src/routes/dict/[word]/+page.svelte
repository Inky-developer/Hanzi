<script lang="ts">
	import type { PageProps } from './$types';
	import DictionaryComponent from '$lib/dictionary/Dictionary.svelte';

	const { params, data }: PageProps = $props();

	const entry = $derived(data.dictionary.lookup(params.word));
</script>

<svelte:head>
	<title>Hanzi Dictionary</title>
	<meta name="description" content="Chinese Dictionary" />
</svelte:head>

<DictionaryComponent dictionary={data.dictionary} {entry} />
