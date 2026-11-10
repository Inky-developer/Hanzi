import type { LayoutServerLoad } from './$types';
import { loadDictionary } from '$lib/dictionary/loadDictionary';

export const prerender = true;

export const load: LayoutServerLoad = async ({ fetch }) => {
	const dictionary = await loadDictionary(fetch);
	const commonHanzi = dictionary.entries
		.filter((it) => it.type === 'hanzi' && it.item.hskLevel !== null)
		.map((it) => it.item.text)
		.slice(0, 1000);
	return {
		commonHanzi: commonHanzi
	};
};
