import type { DictEntry, Hanzi } from '$lib/dictionary/types';
import { removeToneMarks } from '$lib/dictionary/pinyin';

type SearchIndex = {
	pinyin: string;
	dictIndexes: number[];
};

export class Dictionary {
	constructor(
		readonly entries: DictEntry[],
		// Index chinese -> index
		readonly wordIndex: Record<string, number>,
		// Index pinyin -> index
		readonly searchIndex: SearchIndex[]
	) {}

	static fromStorage(data: DictEntry[]): Dictionary {
		const buildWordIndex = (data: DictEntry[]): Record<string, number> =>
			Object.fromEntries(data.map((entry, index) => [entry.item.text, index]));

		const buildSearchIndex = (entries: DictEntry[]): SearchIndex[] => {
			const searchIndex: Record<string, number[]> = {};
			entries.forEach((entry, index) => {
				const pinyins = entry.item.pinyins;
				const spellings = new Set(pinyins.map((text) => normalizePinyinSearch(text)));
				for (const pinyin of spellings) {
					if (searchIndex[pinyin] === undefined) {
						searchIndex[pinyin] = [];
					}
					searchIndex[pinyin].push(index);
				}
			});
			return Object.entries(searchIndex).map(([pinyin, dictIndexes]) => ({
				pinyin,
				dictIndexes
			}));
		};

		const wordIndex = buildWordIndex(data);
		const searchIndex = buildSearchIndex(data);
		return new Dictionary(data, wordIndex, searchIndex);
	}

	lookup(word: string): DictEntry | null {
		const index = this.wordIndex[word];
		if (index === undefined) {
			return null;
		}
		return this.entries[index];
	}

	lookupHanzi(hanzi: string): Hanzi | null {
		const entry = this.lookup(hanzi);
		if (!entry || entry.type !== 'hanzi') {
			return null;
		}
		return entry.item;
	}

	searchPinyin(query: string): DictEntry[] {
		const needle = normalizePinyinSearch(query);
		const indexes = new Set(
			this.searchIndex
				.filter(({ pinyin }) => textMatchLength(needle, pinyin) == needle.length)
				.flatMap((it) => it.dictIndexes)
		);
		return [...indexes].sort((a, b) => a - b).map((index) => this.entries[index]);
	}

	searchHanzi(query: string): DictEntry[] {
		const needle = query.trim();
		return this.entries.filter((it) => textMatchLength(needle, it.item.text) == needle.length);
	}
}

export const normalizePinyinSearch = (pinyin: string): string =>
	removeToneMarks(pinyin).toLowerCase();

export const textMatchLength = (query: string, text: string): number => {
	for (let i = 0; i < query.length; i++) {
		if (i >= text.length || text.charCodeAt(i) !== query.charCodeAt(i)) return i;
	}
	return query.length;
};
