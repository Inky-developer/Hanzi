import { Dictionary } from '$lib/dictionary/dictionary';
import type { StorageData } from '$lib/dictionary/types';
import data from '$lib/generated/data.json';

export const prerender = true;

export const load = () => ({
	dictionary: Dictionary.fromStorage(data as StorageData)
});
