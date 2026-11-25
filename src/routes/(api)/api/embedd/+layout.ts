import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import { loadDictionary } from '$lib/dictionary/loadDictionary';

export const load: LayoutLoad = async ({ fetch }) => {
	const dictionary = browser ? loadDictionary(fetch) : null;
	return { dictionary };
};
