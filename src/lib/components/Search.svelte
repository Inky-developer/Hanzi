<script lang="ts">
	import {
		textMatchLength,
		normalizePinyinSearch,
		normalizeEnglishSearch,
		EMPTY_DICTIONARY
	} from '$lib/dictionary/dictionary';
	import { type DictEntry, dictEntryEq } from '$lib/dictionary/types';
	import { getSearchState, SEARCH_MODES, type SearchMode } from '$lib/state/searchState.svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { Search as SearchIcon } from '@lucide/svelte';
	import { dictionary } from '$lib/state/dictionaryState.svelte';
	import { getEntryURL } from '$lib/state/getEntryURLState.svelte';

	const {
		selected
	}: {
		selected: DictEntry | null;
	} = $props();

	let searchInput: HTMLInputElement;
	export const focus = () => {
		searchInput.focus();
		searchInput.select();
	};
	afterNavigate(() => {
		searchInput.select();
	});

	/** Rendering every match of a one-letter query would mean thousands of nodes. */
	const MAX_RESULTS = 100;
	const PROMPTS: Record<
		SearchMode,
		{
			title: string;
			description: string;
			short: string;
			search: (query: string) => DictEntry[];
			project: (item: DictEntry) => string[];
			normalize: (text: string) => string;
		}
	> = {
		pinyin: {
			title: 'Search Pinyin',
			description: 'Enter a word in pinyin, for example `gong`',
			short: 'P',
			search: (it) => dictionary().searchPinyin(it),
			project: (it) =>
				it.meanings
					?.map((meaning) => meaning.pinyin)
					?.filter((pinyin): pinyin is string => pinyin !== null) ?? [],
			normalize: normalizePinyinSearch
		},
		hanzi: {
			title: 'Search Hanzi',
			description: 'Enter hanzi, for example `工`',
			short: 'H',
			search: (it) => dictionary().searchHanzi(it),
			project: (it) => [it.text],
			normalize: (it) => it.trim()
		},
		english: {
			title: 'Search English',
			description: 'Enter an English word, for example `work`',
			short: 'E',
			search: (it) => dictionary().searchEnglish(it),
			project: (it) => [...new Set(it.meanings?.flatMap((meaning) => meaning.english ?? []))],
			normalize: normalizeEnglishSearch
		}
	};

	const search = getSearchState();
	const query = $derived(search.query);
	const mode = $derived(search.mode);

	const results: DictEntry[] = $derived.by(() => {
		const trimmed = query.trim();
		if (trimmed.length === 0) return [];
		return PROMPTS[mode].search(trimmed);
	});
	const shown = $derived(results.slice(0, MAX_RESULTS));

	const isSelected = (result: DictEntry) => selected !== null && dictEntryEq(selected, result);

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Enter' || shown.length === 0) return;
		event.preventDefault();
		goto(getEntryURL(shown[0].text));
	};

	const nextMode = (): SearchMode => {
		const currentIndex = SEARCH_MODES.indexOf(mode) ?? 0;
		return SEARCH_MODES[(currentIndex + 1) % SEARCH_MODES.length];
	};

	const getOriginalMatchLength = (
		mode: (typeof PROMPTS)[SearchMode],
		match: string,
		normalizedMatchLength: number
	): number => {
		if (normalizedMatchLength === 0) return 0;

		for (let i = 1; i < match.length; i++) {
			if (mode.normalize(match.slice(0, i)).length >= normalizedMatchLength) {
				return i;
			}
		}
		return match.length;
	};

	const getMatchLength = (
		mode: (typeof PROMPTS)[SearchMode],
		needle: string,
		match: string
	): number =>
		getOriginalMatchLength(
			mode,
			match,
			textMatchLength(mode.normalize(needle), mode.normalize(match))
		);
</script>

<div class="flex min-h-0 flex-col">
	<div class="flex gap-2 p-3">
		<div class="relative flex-1">
			<SearchIcon
				class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-paper-400"
			/>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				bind:this={searchInput}
				bind:value={search.query}
				onkeydown={onKeyDown}
				autofocus
				type="search"
				autocomplete="off"
				spellcheck="false"
				aria-label="Search"
				placeholder={PROMPTS[mode].title}
				class="w-full rounded-lg border border-paper-200 bg-white py-2 pr-3 pl-9 text-sm shadow-sm transition outline-none focus:border-ink-500 focus:ring-3 focus:ring-ink-500/30 dark:border-paper-700 dark:bg-black/20 dark:placeholder:text-paper-400"
			/>
		</div>
		<button
			type="button"
			onclick={() => (search.mode = nextMode())}
			class="shrink-0 rounded-lg border border-paper-200 bg-white p-2 text-sm text-paper-400 shadow-sm transition outline-none hover:bg-paper-100 focus-visible:border-ink-500 focus-visible:ring-3 focus-visible:ring-ink-500/30 dark:border-paper-700 dark:bg-black/20 dark:hover:bg-paper-800/60"
		>
			<span class="grid size-[1lh] place-items-center">{PROMPTS[mode].short}</span>
		</button>
	</div>

	{#if query.trim().length > 0}
		<p
			class="border-y border-paper-100 px-4 py-1.5 text-[0.7rem] tracking-wide text-paper-500 uppercase dark:border-paper-800 dark:text-paper-400"
			aria-live="polite"
		>
			{#if dictionary() === EMPTY_DICTIONARY}
				<span class="animate-pulse">Loading</span>
			{:else if results.length === 0}
				No results
			{:else if results.length > MAX_RESULTS}
				{MAX_RESULTS} of {results.length} results
			{:else}
				{results.length} results
			{/if}
		</p>
	{/if}

	<ol class="scroll-thin min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 max-md:max-h-64">
		{#each shown as result (result.text)}
			{@const active = isSelected(result)}
			<li>
				<a
					href={getEntryURL(result.text)}
					aria-current={active ? 'true' : undefined}
					class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-paper-100 dark:hover:bg-paper-800/60
						{active ? 'bg-ink-600/10 dark:bg-ink-600/25' : ''}"
				>
					<span class="min-w-0 shrink-0">
						{result.text}
					</span>
					<span class="ml-auto min-w-0 truncate rounded px-1.5 py-0.5 text-[0.65rem] font-medium">
						{#each PROMPTS[mode].project(result) as prop (prop)}
							{@const matchLength = getMatchLength(PROMPTS[mode], query, prop)}
							{#if matchLength > 0}
								<span class="not-first:ml-2">
									<span class="text-paper-400 dark:text-paper-500"
										>{prop.slice(0, matchLength)}</span
									><span
										class="font-medium text-paper-900 dark:text-paper-100
								{active ? 'text-ink-700 dark:text-ink-300' : ''}">{prop.slice(matchLength)}</span
									>
								</span>
							{/if}
						{/each}
					</span>
				</a>
			</li>
		{/each}

		{#if query.trim().length === 0}
			<p class="px-3 py-6 text-center text-sm text-paper-400 dark:text-paper-500">
				{PROMPTS[mode].description}.
			</p>
		{:else if results.length === 0}
			<p class="px-3 py-6 text-center text-sm text-paper-400 dark:text-paper-500">
				No word found with <span class="font-serif break-all">{query.trim()}</span>.
			</p>
		{/if}
	</ol>
</div>
