import type { DictEntry, KeyedStrokeData } from '../../src/lib/dictionary/types.ts';
import parseHanzi, { type StrokedDictEntry } from './parseDicts.ts';

export type Result = {
	entries: DictEntry[];
	strokes: KeyedStrokeData[];
};

const splitData = (combined: StrokedDictEntry[]): Result => {
	const entries: DictEntry[] = [];
	const strokes: KeyedStrokeData[] = [];

	combined.forEach((entry) => {
		if (entry.type === 'hanzi' && entry.strokeData !== undefined) {
			const { strokeData, ...rest } = entry;
			strokes.push({ ...strokeData, char: entry.text });
			entries.push(rest);
		} else {
			entries.push(entry);
		}
	});

	return { entries, strokes };
};

export const preprocess = async (dictPath: string): Promise<Result> => {
	const combinedData = await parseHanzi(dictPath);
	return splitData(combinedData);
};
