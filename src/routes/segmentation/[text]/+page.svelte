<script lang="ts">
	import SegmentationPanel from '$lib/components/SegmentationPanel.svelte';
	import type { PageProps } from './$types';

	const { params }: PageProps = $props();
</script>

<SegmentationPanel text={params.text} />
