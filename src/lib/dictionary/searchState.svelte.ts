import { createContext } from 'svelte';

/** Search input shared by all pages, so it survives navigating between them. */
export class SearchState {
	query = $state('');
}

export const [getSearchState, setSearchState] = createContext<SearchState>();
