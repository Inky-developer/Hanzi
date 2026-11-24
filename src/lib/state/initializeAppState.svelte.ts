import type { Dictionary } from '$lib/dictionary/dictionary';
import { SearchState, setSearchState } from '$lib/state/searchState.svelte';
import { setDictionary } from '$lib/state/dictionaryState.svelte';
import { setEntryURLState } from '$lib/state/getEntryURLState.svelte';
import type { ResolvedPathname } from '$app/types';

/**
 * Sets up the context shared by all pages of the app.
 * Must be called during initialization of a top-level layout component.
 */
export default (
	getDictionary: () => Promise<Dictionary> | null,
	getEntryURL: (word: string) => ResolvedPathname
) => {
	setEntryURLState(getEntryURL);
	setSearchState(new SearchState());
	$effect(() => {
		getDictionary()?.then((it) => {
			setDictionary(it);
			window.requestIdleCallback(() => {
				it.buildCaches();
			});
		});
	});
};
