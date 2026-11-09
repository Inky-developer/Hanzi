<script lang="ts">
	import type { Snippet } from 'svelte';

	const { title, children }: { title: string; children: Snippet } = $props();
</script>

<section>
	<h3 class="mb-1 text-xs font-medium tracking-wide text-paper-500 uppercase dark:text-paper-400">
		{title}
	</h3>
	{@render children()}
</section>
