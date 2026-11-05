import type { DictEntry, Hanzi } from '$lib/dictionary/types';
import { removeToneMarks } from '$lib/dictionary/pinyin';

type SearchIndex = {
	pinyin: string;
	dictIndexes: number[];
};

export class Dictionary {
	constructor(
		readonly entries: DictEntry[],
		// Index hanzi -> index
		readonly hanziIndex: Record<string, number>,
		// Index pinyin -> index
		readonly searchIndex: SearchIndex[]
	) {}

	static fromStorage(data: DictEntry[]): Dictionary {
		const buildHanziIndex = (data: DictEntry[]): Record<string, number> =>
			Object.fromEntries(
				data.filter((it) => it.type == 'hanzi').map((entry, index) => [entry.item.text, index])
			);

		const buildSearchIndex = (entries: DictEntry[]): SearchIndex[] => {
			const searchIndex: Record<string, number[]> = {};
			entries.forEach((entry, index) => {
				const pinyins = entry.item.pinyins;
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

		const hanziIndex = buildHanziIndex(data);
		const searchIndex = buildSearchIndex(data);
		return new Dictionary(data, hanziIndex, searchIndex);
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
		return entry.item;
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
