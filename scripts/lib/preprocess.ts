import { type StorageData } from '../../src/lib/dictionary/types.ts';
import parseHanzi from './parseHanzi.ts';
import parseCCDict from './parseCCDict.ts';

export const preprocess = async (hanziPath: string, wordPath: string): Promise<StorageData> => {
	const hanzi = await parseHanzi(hanziPath);
	const words = await parseCCDict(wordPath);
	return { words, hanzi };
};
