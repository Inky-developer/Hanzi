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
		private readonly wordIndex: Map<string, number>,
		// Index pinyin -> index
		private pinyinIndex: Index[] | null,
		// Index meaning -> index
		private englishIndex: Index[] | null
	) {}

	static fromStorage(data: DictEntry[]): Dictionary {
		const buildWordIndex = (data: DictEntry[]): Map<string, number> => {
			// Simplified text has precedence over traditional text
			const index: Map<string, number> = new Map();
			const insertIfMissing = (key: string, i: number) => {
				if (!index.has(key)) index.set(key, i);
			};
			data.forEach((entry, i) => insertIfMissing(entry.text, i));
			data.forEach((entry, i) => entry.traditional?.forEach((trad) => insertIfMissing(trad, i)));
			return index;
		};

		return new Dictionary(data, buildWordIndex(data), null, null);
	}

	private buildIndex = (getKey: (entry: DictEntry) => string[]): Index[] => {
		const groups = groupByKey(
			this.entries.map((_, i) => i),
			(idx) => getKey(this.entries[idx])
		);
		return Array.from(groups, ([text, dictIndexes]) => ({
			text,
			dictIndexes: [...dictIndexes]
		}));
	};

	private buildPinyinIndex = (): Index[] =>
		this.buildIndex(
			(entry) =>
				entry.meanings
					?.map((meaning) =>
						meaning.pinyin !== null ? normalizePinyinSearch(meaning.pinyin) : null
					)
					.filter((pinyin): pinyin is string => pinyin !== null) ?? []
		);
	private buildEnglishIndex = (): Index[] =>
		this.buildIndex((entry) => [
			...new Set(
				entry.meanings?.flatMap(
					(meaning) => meaning.english?.map((it) => normalizeEnglishSearch(it)) ?? []
				) ?? []
			)
		]);

	private getPinyinIndex = (): Index[] => (this.pinyinIndex ??= this.buildPinyinIndex());
	private getEnglishIndex = (): Index[] => (this.englishIndex ??= this.buildEnglishIndex());

	buildCaches = (): void => {
		this.getPinyinIndex();
		this.getEnglishIndex();
	};

	lookup(word: string): DictEntry | null {
		const index = this.wordIndex.get(word);
		if (index === undefined) {
			return null;
		}
		return this.entries[index];
	}

	lookupHanzi(hanzi: string): Hanzi | null {
		const entry = this.lookup(hanzi);
		if (entry?.type !== 'hanzi') {
			return null;
		}
		return entry;
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
		return this.searchIndex(needle, this.getPinyinIndex());
	}

	searchEnglish(query: string): DictEntry[] {
		const needle = normalizeEnglishSearch(query);
		return this.searchIndex(needle, this.getEnglishIndex());
	}

	searchHanzi(query: string): DictEntry[] {
		const needle = query.trim();
		return this.entries.filter((it) => textMatchLength(needle, it.text) == needle.length);
	}
}

export const EMPTY_DICTIONARY = Dictionary.fromStorage([]);

export const normalizePinyinSearch = (pinyin: string): string =>
	removeToneMarks(pinyin.replaceAll(/\s/g, '')).toLowerCase();

export const normalizeEnglishSearch = (search: string): string => search.trim().toLowerCase();

export const textMatchLength = (query: string, text: string): number => {
	for (let i = 0; i < query.length; i++) {
		if (i >= text.length || text.charCodeAt(i) !== query.charCodeAt(i)) return i;
	}
	return query.length;
};
