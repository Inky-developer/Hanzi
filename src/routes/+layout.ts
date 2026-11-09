import { Dictionary } from '$lib/dictionary/dictionary';
import data from '$lib/generated/data.json?raw';

export const prerender = true;

export const load = () => ({
	dictionary: Dictionary.fromStorage(JSON.parse(data))
});
