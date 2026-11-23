import { vi } from 'vitest';
import { readFileSync } from 'fs';
import { Dictionary } from '$lib/dictionary/dictionary';

vi.mock(import('$lib/dictionary/loadDictionary'), () => {
	return {
		loadDictionary: async (): Promise<Dictionary> => {
			return Promise.resolve(
				Dictionary.fromStorage(JSON.parse(readFileSync('static/generated/data.json', 'utf-8')))
			);
		}
	};
});
