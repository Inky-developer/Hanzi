<script lang="ts">
	import { type DictEntry, dictEntryCommon } from '$lib/dictionary/types';
	import type { Dictionary } from '$lib/dictionary/dictionary';

	// eslint-disable-next-line svelte/no-unused-props
	const {
		entry
	}: { entry: DictEntry; onEntry: (entry: DictEntry) => void; dictionary: Dictionary } = $props();

	const common = $derived(dictEntryCommon(entry));
</script>

<div class="flex min-h-0 flex-col">
	<header class="border-b border-paper-100 px-6 py-4 dark:border-paper-800">
		<div class="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
			<h2 class="font-serif text-8xl font-semibold text-paper-900 dark:text-paper-50">
				{common.text}
			</h2>
		</div>

		{#if common.pinyins}
			<span
				class="flex flex-wrap items-baseline gap-x-1.5 font-serif text-sm text-paper-700 dark:text-paper-300"
			>
				{#each common.pinyins as pinyin (pinyin)}
					<span
						class="not-first:before:mr-1.5 not-first:before:text-paper-300 not-first:before:content-['·'] dark:not-first:before:text-paper-700"
					>
						{pinyin}
					</span>
				{/each}
			</span>
		{/if}

		{#if common.english.length > 0}
			<span
				lang="en"
				class="flex flex-wrap items-baseline gap-x-1.5 font-serif text-sm text-paper-700 italic dark:text-paper-300"
			>
				<span
					class="not-first:before:mr-1.5 not-first:before:text-paper-300 not-first:before:content-['·'] dark:not-first:before:text-paper-700"
				>
					{common.english}
				</span>
			</span>
		{/if}
	</header>
</div>
