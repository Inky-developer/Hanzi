import { createContext } from 'svelte';

export const SEARCH_MODES = ['pinyin', 'hanzi', 'english'] as const;
export type SearchMode = (typeof SEARCH_MODES)[number];

/** Search input shared by all pages, so it survives navigating between them. */
export class SearchState {
	query = $state('');
	mode = $state<SearchMode>('pinyin');
}

export const [getSearchState, setSearchState] = createContext<SearchState>();
