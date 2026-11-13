<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { Dictionary } from '$lib/dictionary/dictionary';
	import Search from '$lib/dictionary/Search.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { afterNavigate } from '$app/navigation';

	const {
		commonHanzi,
		dictionary
	}: { commonHanzi: string[]; dictionary: Promise<Dictionary> | null } = $props();
	const MILLISECONDS_PER_DAY = 86_400_000;

	const localDayNumber = (date: Date): number =>
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MILLISECONDS_PER_DAY;

	let symbolOfTheDay = $state('');

	onMount(() => {
		symbolOfTheDay = commonHanzi[localDayNumber(new Date()) % commonHanzi.length];
	});

	const links = [
		{ href: resolve('/'), label: 'Wörterbuch' },
		{ href: resolve('/about'), label: 'Über' }
	];

	let dialog: HTMLDialogElement;
	afterNavigate(() => dialog.close());
</script>

<header
	class="sticky top-0 z-10 border-b border-paper-200 bg-white/70 backdrop-blur-md dark:border-paper-800 dark:bg-black/30"
>
	<div class="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
		<a href={resolve('/')} class="group flex items-center gap-2.5">
			<span
				class="grid size-8 place-items-center rounded-lg bg-ink-600 font-serif text-lg leading-none font-semibold text-white shadow-sm"
				aria-hidden="true">{symbolOfTheDay}</span
			>
			<span class="flex flex-col leading-tight">
				<span class="font-serif text-base font-semibold text-paper-900 dark:text-paper-50">
					Hanzi
				</span>
				<span class="text-[0.7rem] tracking-wide text-paper-500 uppercase dark:text-paper-400">
					Chinesisch
				</span>
			</span>
		</a>

		<nav class="ml-auto flex items-center">
			<ul class="flex items-center gap-1">
				{#each links as link (link.href)}
					{@const current = page.url.pathname === link.href}
					<li>
						<a
							href={link.href}
							aria-current={current ? 'page' : undefined}
							class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-paper-200/70 dark:hover:bg-paper-800
								{current
								? 'bg-paper-200/60 text-ink-700 dark:bg-paper-800 dark:text-ink-300'
								: 'text-paper-500 dark:text-paper-400'}"
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>

			<button class="md:hidden" onclick={() => dialog.showModal()}>
				<SearchIcon class="mx-3 size-4 text-paper-500 dark:text-paper-400" />
			</button>

			<!--	Dictionary is not loaded during pre-rendering.-->
			<!--	Only show the search once the dictionary has loaded.-->
			{#snippet loading()}
				<div class="w-full text-center">Loading dictionary...</div>
			{/snippet}
			<dialog
				bind:this={dialog}
				class="m-auto w-full rounded-xl shadow-2xl shadow-black backdrop:bg-paper-900/40 backdrop:backdrop-blur-md"
			>
				{#if dictionary}
					{#await dictionary}
						{@render loading()}
					{:then dictionary}
						<Search {dictionary} selected={null} />
					{:catch}
						<div class="w-full text-center">Failed to load data</div>
					{/await}
				{:else}
					{@render loading()}
				{/if}
			</dialog>
		</nav>
	</div>
</header>
