import { Dictionary } from '$lib/dictionary/dictionary';
import data from '$lib/generated/data.json';
import type { DictEntry } from '$lib/dictionary/types';

export const prerender = true;

export const load = () => ({
	dictionary: Dictionary.fromStorage(data as DictEntry[])
});
