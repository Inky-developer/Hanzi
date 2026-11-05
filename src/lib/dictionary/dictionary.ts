import type { DictEntry, Hanzi, StorageData } from '$lib/dictionary/types';

type SearchIndex = {
	pinyin: string;
	dictIndexes: number[];
};

/** Converts e.g. "shì" to "shi" and "lǜ" to "lu". */
const removeToneMarks = (pinyin: string): string =>
	pinyin
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();

export class Dictionary {
	constructor(
		readonly entries: DictEntry[],
		// Index hanzi -> index
		readonly hanziIndex: Record<string, number>,
		// Index pinyin -> index
		readonly searchIndex: SearchIndex[]
	) {}

	static fromStorage(data: StorageData): Dictionary {
		const buildHanziIndex = (hanzi: Hanzi[]): Record<string, number> =>
			Object.fromEntries(hanzi.map((hanzi, index) => [hanzi.symbol, index]));

		const buildEntries = (data: StorageData): DictEntry[] => {
			const hanzi: DictEntry[] = data.hanzi.map((it) => ({ type: 'hanzi', hanzi: it }));
			const words: DictEntry[] = data.words.map((it) => ({ type: 'word', word: it }));
			return [...hanzi, ...words];
		};

		const buildSearchIndex = (entries: DictEntry[]): SearchIndex[] => {
			const searchIndex: Record<string, number[]> = {};
			entries.forEach((entry, index) => {
				const pinyins = entry.type === 'word' ? [entry.word.pinyin] : entry.hanzi.pinyins;
				const spellings = new Set(pinyins.map((text) => removeToneMarks(text)));
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

		const hanziIndex = buildHanziIndex(data.hanzi);
		const entries = buildEntries(data);
		const searchIndex = buildSearchIndex(entries);
		return new Dictionary(entries, hanziIndex, searchIndex);
	}

	lookup(hanzi: string): Hanzi | null {
		const index = this.hanziIndex[hanzi];
		if (index === undefined) {
			return null;
		}
		const entry = this.entries[index];
		if (entry.type === 'word') {
			// Should not happen
			return null;
		}
		return entry.hanzi;
	}

	search(query: string): DictEntry[] {
		const needle = query.toLowerCase();
		const indexes = new Set(
			this.searchIndex
				.filter(({ pinyin }) => pinyin.startsWith(needle))
				.flatMap((it) => it.dictIndexes)
		);
		return [...indexes].sort((a, b) => a - b).map((index) => this.entries[index]);
	}
}
