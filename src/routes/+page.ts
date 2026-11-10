import type { PageLoad } from './$types';
import { loadDictionary } from '$lib/dictionary/loadDictionary';
import { browser } from '$app/environment';
import type { Dictionary } from '$lib/dictionary/dictionary';

// since there's no dynamic data here, we can pre-render
// it so that it gets served as a static asset in production
export const prerender = true;

/**
 * Only loads the dictionary in the browser, but not at build time.
 * The reason is that otherwise svelte would embed the whole generated JSON file
 * into the initial HTML page, slowing down the initial load a lot.
 */
export const load: PageLoad<{ dictionary: Dictionary | null }> = async ({ fetch }) => {
	if (!browser) {
		return { dictionary: null };
	}

	return { dictionary: await loadDictionary(fetch) };
};
