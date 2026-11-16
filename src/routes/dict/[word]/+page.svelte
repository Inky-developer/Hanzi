<script lang="ts">
	import type { PageProps } from './$types';
	import DictionaryComponent from '$lib/dictionary/Dictionary.svelte';
	import { dictionary } from '$lib/dictionary/dictionaryState.svelte';

	const { params }: PageProps = $props();
	const entry = $derived(dictionary().lookup(params.word));
</script>

<svelte:head>
	<title>Hanzi Dictionary</title>
	<meta name="description" content="Chinese Dictionary" />
</svelte:head>

<DictionaryComponent {entry} />
