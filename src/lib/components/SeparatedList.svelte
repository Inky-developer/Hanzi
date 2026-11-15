<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		items: T[];
		item: Snippet<[T]>;
	} & Omit<HTMLAttributes<HTMLUListElement>, 'children'>;

	const { items, item, class: className, ...rest }: Props = $props();
</script>

<ul class={['flex flex-wrap items-baseline gap-x-1.5', className]} {...rest}>
	{#each items as it (it)}
		<li
			class="not-first:before:mr-1.5 not-first:before:text-paper-300 not-first:before:content-['·'] dark:not-first:before:text-paper-700"
		>
			{@render item(it)}
		</li>
	{/each}
</ul>
