import type { NonEmpty } from '$lib/utils/types';

export type DictEntry = ({ type: 'word' } & Word) | ({ type: 'hanzi' } & Hanzi);

export const dictEntryEq = (lhs: DictEntry, rhs: DictEntry): boolean =>
	lhs.type === rhs.type && lhs.text === rhs.text;

export const dictEntrySortFrequency = (entry: DictEntry) =>
	entry.type === 'hanzi' ? entry.charFrequency : entry.wordFrequency;

export type Common = {
	text: string;
	// Simplified variants always take precedence in this app.
	// `traditional` only contains traditional variants that are different to the simplified text.
	traditional?: NonEmpty<string>;
	pinyins?: NonEmpty<string>;
	english?: NonEmpty<string>;
	variantOf?: NonEmpty<string>;
	countingWords?: NonEmpty<string>;
	/**
	 * Share of all characters (for hanzi) or all words (for words) in the book corpus.
	 * Raw counts are not used, since the word corpus is much larger than the character corpus.
	 */
	wordFrequency: number;
	hskLevel?: number;
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

export type KeyedStrokeData = StrokeData & { char: string };

export type Hanzi = Common & {
	charFrequency: number;
	characterHint: string;
};
