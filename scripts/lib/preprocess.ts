import type { DictEntry } from '../../src/lib/dictionary/types.ts';
import parseHanzi from './parseDicts.ts';

export const preprocess = async (dictPath: string): Promise<DictEntry[]> => {
	return await parseHanzi(dictPath);
};
