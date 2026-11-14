import { createContext } from 'svelte';

export type SearchMode = 'pinyin' | 'hanzi';

/** Search input shared by all pages, so it survives navigating between them. */
export class SearchState {
	query = $state('');
	mode = $state<SearchMode>('pinyin');
}

export const [getSearchState, setSearchState] = createContext<SearchState>();
