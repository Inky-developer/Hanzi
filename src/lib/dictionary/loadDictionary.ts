import { Dictionary } from '$lib/dictionary/dictionary';
import { asset } from '$app/paths';
import { Strokes } from '$lib/dictionary/strokes';
import type { KeyedStrokeData } from '$lib/dictionary/types';

let cachedDictionary: Promise<Dictionary> | undefined;
let cachedStrokes: Promise<Strokes> | undefined;

/** Loads the dictionary once and reuses it for all subsequent calls. */
export const loadDictionary = (fetch: typeof globalThis.fetch): Promise<Dictionary> =>
	(cachedDictionary ??= fetch(asset('/generated/data.json'))
		.then((resp) => resp.json())
		.then((data) => Dictionary.fromStorage(data))
		.catch((error) => {
			cachedDictionary = undefined;
			throw error;
		}));

export const loadStrokes = (fetch: typeof globalThis.fetch): Promise<Strokes> =>
	(cachedStrokes ??= fetch(asset('/generated/strokes.json'))
		.then((resp) => resp.json())
		.then((data: KeyedStrokeData[]) => Strokes.fromStrokes(data))
		.catch((error) => {
			cachedStrokes = undefined;
			throw error;
		}));
