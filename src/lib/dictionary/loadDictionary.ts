import { Dictionary } from '$lib/dictionary/dictionary';
import { asset } from '$app/paths';

let cachedDictionary: Promise<Dictionary> | undefined;

/** Loads the dictionary once and reuses it for all subsequent calls. */
export const loadDictionary = (fetch: typeof globalThis.fetch): Promise<Dictionary> =>
	(cachedDictionary ??= fetch(asset('/generated/data.json'))
		.then((resp) => resp.json())
		.then((data) => Dictionary.fromStorage(data))
		.catch((error) => {
			cachedDictionary = undefined;
			throw error;
		}));
