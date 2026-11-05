export type StorageData = {
	words: Word[];
	hanzi: Hanzi[];
};

export type DictEntry =
	| {
			type: 'word';
			word: Word;
	  }
	| {
			type: 'hanzi';
			hanzi: Hanzi;
	  };

export type DictEntryCommon = {
	text: string;
	pinyins: string[];
	english: string;
};

export const dictEntryEq = (lhs: DictEntry, rhs: DictEntry): boolean => {
	if (lhs.type === 'word' && rhs.type === 'word') {
		return wordEq(lhs.word, rhs.word);
	}
	if (lhs.type === 'hanzi' && rhs.type === 'hanzi') {
		return hanziEq(lhs.hanzi, rhs.hanzi);
	}
	return false;
};

export const dictEntryCommon = (entry: DictEntry): DictEntryCommon => {
	if (entry.type === 'word') {
		return {
			text: entry.word.hanzi.join(''),
			pinyins: [entry.word.pinyin],
			english: entry.word.english
		};
	}
	return {
		text: entry.hanzi.symbol,
		pinyins: entry.hanzi.pinyins,
		english: entry.hanzi.english
	};
};

export type Word = {
	hanzi: string[];
	pinyin: string;
	english: string;
};

export const wordEq = (lhs: Word, rhs: Word): boolean =>
	lhs.hanzi.length === rhs.hanzi.length &&
	lhs.hanzi.every((lhsHanzi, index) => lhsHanzi === rhs.hanzi[index]);

export type Hanzi = {
	symbol: string;
	pinyins: string[];
	frequency: number;
	english: string;
	characterHint: string;
	hskLevel: number | null;
};

export const hanziEq = (lhs: Hanzi, rhs: Hanzi): boolean => lhs.symbol === rhs.symbol;
