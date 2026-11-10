import type { PageLoad } from './$types';
import { loadDictionary } from '$lib/dictionary/loadDictionary';

// Cannot pre-render this, as the word is supplied dynamically
export const prerender = false;

export const load: PageLoad = async ({ fetch }) => ({ dictionary: loadDictionary(fetch) });
