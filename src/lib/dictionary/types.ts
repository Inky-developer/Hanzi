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
	// Simplified variants always take precedence in this app.
	// `traditional` only contains traditional variants that are different to the simplified text.
	traditional: string[];
	pinyins: string[];
	english: string[];
	variantOf: string[];
	/**
	 * Share of all characters (for hanzi) or all words (for words) in the book corpus.
	 * Raw counts are not used, since the word corpus is much larger than the character corpus.
	 */
	frequency: number;
	hskLevel: number | null;
};

export type Word = Common;

/**
 * Stroke graphics in the makeMeAHanzi format: https://github.com/skishore/makemeahanzi/tree/master#graphicstxt-keys.
 * The strokes are svg instructions for drawing the character and the medians are a list of points per stroke that is
 * used for animation the character.
 */
export type StrokeData = {
	strokes: string[];
	medians: [number, number][][];
};

export type Hanzi = Common & {
	characterHint: string;
	strokeData?: StrokeData;
};
