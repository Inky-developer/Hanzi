export type DictEntry =
	| {
			type: 'word';
			item: Word;
	  }
	| {
			type: 'hanzi';
			item: Hanzi;
	  };

export const dictEntryEq = (lhs: DictEntry, rhs: DictEntry): boolean =>
	lhs.type === rhs.type && lhs.item.text === rhs.item.text;

export type Common = {
	text: string;
	pinyins: string[];
	english: string[];
	/**
	 * Share of all characters (for hanzi) or all words (for words) in the book corpus.
	 * Raw counts are not used, since the word corpus is much larger than the character corpus.
	 */
	frequency: number;
};

export type Word = Common;

export type Hanzi = Common & {
	characterHint: string;
	hskLevel: number | null;
};
