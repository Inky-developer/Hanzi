<script lang="ts">
	import type { PageProps } from './$types';
	import DictionaryComponent from '$lib/components/Dictionary.svelte';
	import { dictionary } from '$lib/state/dictionaryState.svelte';

	const { params }: PageProps = $props();
	const entry = $derived(dictionary().lookup(params.word));
</script>

<svelte:head>
	<title>Hanzi Dictionary</title>
	<meta name="description" content="Chinese Dictionary" />
</svelte:head>

<DictionaryComponent {entry} />
