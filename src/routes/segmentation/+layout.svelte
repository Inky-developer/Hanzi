<script lang="ts">
	import type { LayoutProps } from './$types.js';

	const { children }: LayoutProps = $props();
</script>

<section class="flex flex-1 flex-col justify-center gap-8">
	<div class="mx-auto max-w-xl text-center text-paper-700 dark:text-paper-300">
		<h1
			class="font-serif text-3xl font-semibold text-balance text-paper-900 sm:text-4xl dark:text-paper-50"
		>
			Read
		</h1>

		This tool splits the entered text into words and makes them clickable, so that the word
		definitions can be looked up quickly.
	</div>

	{@render children()}
</section>
