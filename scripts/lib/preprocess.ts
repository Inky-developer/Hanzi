import type { DictEntry, StrokeData } from '../../src/lib/dictionary/types.ts';
import parseHanzi, { type StrokedDictEntry } from './parseDicts.ts';

export type Result = {
	entries: DictEntry[];
	strokes: StrokeData[];
};

const splitData = (combined: StrokedDictEntry[]): Result => {
	const entries: DictEntry[] = [];
	const strokes: StrokeData[] = [];

	combined.forEach((entry) => {
		if (entry.type === 'hanzi' && entry.item.strokeData !== undefined) {
			const strokesIndex = strokes.length;
			const { strokeData, ...rest } = entry.item;
			strokes.push(strokeData);
			entries.push({ type: 'hanzi', item: { ...rest, strokesIndex } });
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
