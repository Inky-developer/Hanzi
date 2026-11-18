import type { DictEntry, StrokeData } from '../../src/lib/dictionary/types.ts';
import parseHanzi, { type StrokedDictEntry } from './parseDicts.ts';

export type Result = {
	entries: DictEntry[];
	strokes: StrokeData[];
};

const splitData = (combined: StrokedDictEntry[]): Result => {
	const strokes: StrokeData[] = [];

	combined.forEach((entry) => {
		if (entry.type === 'hanzi' && entry.item.strokeData !== undefined) {
			const strokesIndex = strokes.length;
			strokes.push(entry.item.strokeData);
			delete entry.item.strokeData;
			entry.item.strokesIndex = strokesIndex;
		}
	});

	return { entries: combined, strokes };
};

export const preprocess = async (dictPath: string): Promise<Result> => {
	const combinedData = await parseHanzi(dictPath);
	return splitData(combinedData);
};
