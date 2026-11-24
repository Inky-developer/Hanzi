import { readFile } from 'node:fs/promises';
import { error, type RequestHandler } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';
import type { KeyedStrokeData } from '$lib/dictionary/types';
import { loadStrokes } from '$lib/dictionary/loadDictionary';

export const prerender = true;

/** Generates an endpoint for every hanzi that has stroke data. */
export const entries: EntryGenerator = async () => {
	const data: KeyedStrokeData[] = JSON.parse(
		await readFile('static/generated/strokes.json', 'utf-8')
	);
	return data.map((entry) => ({ hanzi: entry.char }));
};

/**
 * Returns strokes of a character in the format understandable by the hanziwriter library.
 * Can be used for offline anki cards that make use of this library.
 */
export const GET: RequestHandler = async ({ fetch, params }) => {
	if (params.hanzi === undefined) error(404, 'Character not specified');
	const strokes = await loadStrokes(fetch);
	const strokeData = strokes.lookup(params.hanzi);
	if (strokeData === undefined) error(404, `No stroke data for the character`);
	return Response.json(strokeData);
};
