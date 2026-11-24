<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { ArrowLeft } from '@lucide/svelte';

	let depth = $state(0);
	afterNavigate((navigation) => {
		if (navigation.type === 'enter') depth = 0;
		else if (navigation.type === 'popstate') depth += navigation.delta;
		else depth += 1;
	});
</script>

{#if depth > 0}
	<button type="button" onclick={() => history.back()} aria-label="Back">
		<ArrowLeft class="size-4" />
	</button>
{/if}
