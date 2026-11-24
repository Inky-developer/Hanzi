import { loadDictionary } from '$lib/dictionary/loadDictionary';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async ({ fetch }) => {
	const dictionary = await loadDictionary(fetch);
	return json(
		dictionary.entries
			.filter((it) => it.type === 'hanzi' && it.hskLevel !== null)
			.map((it) => it.text)
			.slice(0, 1000)
	);
};
