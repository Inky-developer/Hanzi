import type { DictEntry, Hanzi } from '$lib/dictionary/types';
import { removeToneMarks } from '$lib/dictionary/pinyin';
import { groupByKey } from '$lib/utils/functional';

type Index = {
	text: string;
	dictIndexes: number[];
};

export class Dictionary {
	constructor(
		readonly entries: DictEntry[],
		// Index chinese -> index
		readonly wordIndex: Record<string, number>,
		// Index pinyin -> index
		readonly pinyinIndex: Index[],
		// Index meaning -> index
		readonly englishIndex: Index[]
	) {}

	static fromStorage(data: DictEntry[]): Dictionary {
		const buildWordIndex = (data: DictEntry[]): Record<string, number> => {
			// Simplified text has precedence over traditional text
			const index: Record<string, number> = {};
			data.forEach((entry, i) => (index[entry.item.text] ??= i));
			data.forEach((entry, i) => entry.item.traditional.forEach((trad) => (index[trad] ??= i)));
			return index;
		};

		const buildIndex = (entries: DictEntry[], getKey: (entry: DictEntry) => string[]): Index[] => {
			const groups = groupByKey(
				entries.map((_, i) => i),
				(idx) => getKey(entries[idx])
			);
			return groups
				.entries()
				.map(([text, dictIndexes]) => ({
					text,
					dictIndexes: [...dictIndexes]
				}))
				.toArray();
		};

		const buildPinyinIndex = (entries: DictEntry[]): Index[] =>
			buildIndex(entries, (entry) => entry.item.pinyins.map((it) => normalizePinyinSearch(it)));
		const buildEnglishIndex = (entries: DictEntry[]): Index[] =>
			buildIndex(entries, (entry) => entry.item.english.map((it) => normalizeEnglishSearch(it)));

		const wordIndex = buildWordIndex(data);
		const searchIndex = buildPinyinIndex(data);
		const englishIndex = buildEnglishIndex(data);
		return new Dictionary(data, wordIndex, searchIndex, englishIndex);
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

	private searchIndex(query: string, index: Index[]): DictEntry[] {
		const indexes = new Set(
			index
				.filter(({ text }) => textMatchLength(query, text) == query.length)
				.flatMap((it) => it.dictIndexes)
		);
		return [...indexes].sort((a, b) => a - b).map((index) => this.entries[index]);
	}

	searchPinyin(query: string): DictEntry[] {
		const needle = normalizePinyinSearch(query);
		return this.searchIndex(needle, this.pinyinIndex);
	}

	searchEnglish(query: string): DictEntry[] {
		const needle = normalizeEnglishSearch(query);
		return this.searchIndex(needle, this.englishIndex);
	}

	searchHanzi(query: string): DictEntry[] {
		const needle = query.trim();
		return this.entries.filter((it) => textMatchLength(needle, it.item.text) == needle.length);
	}
}

export const EMPTY_DICTIONARY = Dictionary.fromStorage([]);

export const normalizePinyinSearch = (pinyin: string): string =>
	removeToneMarks(pinyin.trim()).toLowerCase();

export const normalizeEnglishSearch = (search: string): string => search.trim().toLowerCase();

export const textMatchLength = (query: string, text: string): number => {
	for (let i = 0; i < query.length; i++) {
		if (i >= text.length || text.charCodeAt(i) !== query.charCodeAt(i)) return i;
	}
	return query.length;
};
