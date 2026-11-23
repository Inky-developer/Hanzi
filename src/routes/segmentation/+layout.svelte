<script lang="ts">
	import type { LayoutProps } from './$types.js';

	const { children }: LayoutProps = $props();
</script>

<section class="flex flex-1 flex-col justify-center gap-8">
	<div class="mx-auto max-w-xl text-center">
		<h1
			class="font-serif text-3xl font-semibold text-balance text-paper-900 sm:text-4xl dark:text-paper-50"
		>
			Analyze Words
		</h1>
	</div>

	{@render children()}
</section>
