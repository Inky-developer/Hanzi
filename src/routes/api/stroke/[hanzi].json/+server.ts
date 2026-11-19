import { error, type RequestHandler } from '@sveltejs/kit';
import { loadDictionary, loadStrokes } from '$lib/dictionary/loadDictionary';

export const prerender = false;

/**
 * Returns strokes of a character in the format understandable by the hanziwriter library.
 * Can be used for offline anki cards that make use of this library.
 */
export const GET: RequestHandler = async ({ fetch, params }) => {
	if (params.hanzi === undefined) error(404, 'Character not specified');
	const [dictionary, strokes] = await Promise.all([loadDictionary(fetch), loadStrokes(fetch)]);
	const strokeData = strokes.lookup(dictionary, '喔');
	if (strokeData === undefined) error(404, `No stroke data for the character`);
	return Response.json(strokeData);
};
