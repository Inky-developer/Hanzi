import { readFile } from 'node:fs/promises';
import { error, type RequestHandler } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';
import type { DictEntry } from '$lib/dictionary/types';
import { loadDictionary, loadStrokes } from '$lib/dictionary/loadDictionary';

export const prerender = true;

/** Generates an endpoint for every hanzi that has stroke data. */
export const entries: EntryGenerator = async () => {
	const data: DictEntry[] = JSON.parse(await readFile('static/generated/data.json', 'utf-8'));
	return data
		.filter((entry) => entry.type === 'hanzi' && entry.item.strokesIndex !== undefined)
		.map((entry) => ({ hanzi: entry.item.text }));
};

/**
 * Returns strokes of a character in the format understandable by the hanziwriter library.
 * Can be used for offline anki cards that make use of this library.
 */
export const GET: RequestHandler = async ({ fetch, params }) => {
	if (params.hanzi === undefined) error(404, 'Character not specified');
	const [dictionary, strokes] = await Promise.all([loadDictionary(fetch), loadStrokes(fetch)]);
	const strokeData = strokes.lookup(dictionary, params.hanzi);
	if (strokeData === undefined) error(404, `No stroke data for the character`);
	return Response.json(strokeData);
};
