import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';
import { browser } from '$app/environment';
import { loadDictionary, loadStrokes } from '$lib/dictionary/loadDictionary';

export const prerender = true;

/**
 * Only loads the dictionary in the browser, but not at build time.
 * The reason is that otherwise svelte would embed the whole generated JSON file
 * into the initial HTML page, slowing down the initial load a lot.
 */
export const load: LayoutLoad = async ({ fetch }) => {
	const dictionary = browser ? loadDictionary(fetch) : null;
	const commonHanzi: string[] = await fetch(resolve('/api/common_hanzi.json')).then((it) =>
		it.json()
	);
	return { commonHanzi, dictionary };
};
