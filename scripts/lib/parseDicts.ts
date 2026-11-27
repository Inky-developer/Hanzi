import {
	type Common,
	type DictEntry,
	dictEntrySortFrequency,
	type Hanzi,
	type StrokeData,
	type Word
} from '../../src/lib/dictionary/types.ts';
import readLines from './readLines.ts';
import { type NonEmpty, nonEmpty } from '../../src/lib/utils/types.ts';

type StrokedHanzi = Hanzi & { strokeData?: StrokeData };

export type StrokedDictEntry =
	Exclude<DictEntry, { type: 'hanzi' }> | ({ type: 'hanzi' } & StrokedHanzi);

type Source = 'unicode' | 'academia-sinica' | 'makemeahanzi' | 'baxter-sagart' | 'dong-chinese';

type DictStrokeData = {
	/** SVG path per stroke */
	strokes: string[];
	/** Median points ([x, y]) per stroke */
	medians: [number, number][][];
};

type CharacterImage = {
	url?: string;
	source: 'academia-sinica' | 'dong-chinese' | 'makemeahanzi';
	description: string;
	type: 'Oracle' | 'Bronze' | 'Seal' | 'Clerical' | 'Regular';
	era: string;
	data?: DictStrokeData;
	/** Stroke indices per component */
	fragments?: number[][];
};

type ComponentType =
	| 'iconic'
	| 'meaning'
	| 'sound'
	| 'remnant'
	| 'distinguishing'
	| 'unknown'
	| 'simplified'
	| 'deleted';

type CharacterComponent = {
	type: ComponentType[];
	character: string;
	hint?: string | null;
	isOldPronunciation?: boolean;
	isGlyphChanged?: boolean;
	isFromOriginalMeaning?: boolean;
};

type OldPronunciation = {
	pinyin?: string;
	/** Middle Chinese */
	MC: string;
	/** Old Chinese */
	OC?: string;
	gloss?: string;
	source?: 'baxter-sagart';
};

type CharacterStatistics = {
	hskLevel: number;
	movieWordCount?: number;
	movieWordCountPercent?: number;
	movieWordRank?: number;
	movieWordContexts?: number;
	movieWordContextsPercent?: number;
	bookWordCount?: number;
	bookWordCountPercent?: number;
	bookWordRank?: number;
	movieCharCount?: number;
	movieCharCountPercent?: number;
	movieCharRank?: number;
	movieCharContexts?: number;
	movieCharContextsPercent?: number;
	bookCharCount?: number;
	bookCharCountPercent?: number;
	bookCharRank?: number;
	topWords?: {
		word: string;
		share: number;
		trad: string;
		gloss: string;
	}[];
	pinyinFrequency?: number;
};

type Entry = {
	_id: string;
	char: string;
	// e.g. "U+3806"
	codepoint?: string;
	strokeCount?: number | string;
	sources?: Source[];
	gloss?: string;
	hint?: string;
	originalMeaning?: string;
	// I think that is an old dictionary
	shuowen?: string;
	isVerified?: boolean;
	variantOf?: string;
	simpVariants?: string[];
	tradVariants?: string[];
	variants?: {
		char: string | null;
		parts: string | null;
		source: 'academia-sinica';
	}[];
	components?: CharacterComponent[];
	images?: CharacterImage[] | null;
	data?: (DictStrokeData & { character?: string }) | null;
	fragments?: number[][] | null;
	comments?: { source: 'academia-sinica'; text: string }[];
	// Formatted as "name|url"
	customSources?: string[];
	oldPronunciations?: OldPronunciation[] | null;
	pinyinFrequencies?: { pinyin: string; count: number }[];
	statistics?: CharacterStatistics;
};

type WordEntryItem = {
	source?: 'unicode' | 'cedict';
	pinyin?: string;
	simpTrad?: 'both';
	definitions?: string[];
};

type WordEntry = {
	_id: string;
	simp: string;
	trad: string;
	gloss: string;
	items: WordEntryItem[];
	pinyinSearchString: string;
	statistics?: CharacterStatistics;
};

type DictionaryEntry = Entry | WordEntry;

/** Some common characters like 更 are marked as variants of obscure forms, so HSK characters are kept. */
const isNonHskVariant = (entry: Entry): boolean =>
	entry.variantOf !== undefined && entry.statistics?.hskLevel === undefined;

/** Characters like 后 list themselves as their own simplified form and are kept. */
const isTraditionalOnly = (entry: Entry): boolean =>
	entry.simpVariants !== undefined && !entry.simpVariants.includes(entry.char);

const MAX_HSK_LEVEL = 9;
const mapHSK = (level: number | undefined): number | undefined => {
	if (level === undefined || level > MAX_HSK_LEVEL) {
		return undefined;
	}
	return level;
};

const CEDICT_REFERENCE = /(\p{Script=Han}+)(?:\|(\p{Script=Han}+))?/u;
const parseCEDICTReference = (ref: string): string => {
	const match = ref.match(CEDICT_REFERENCE);
	if (!match) return ref;
	const [, trad, simp] = match;
	return simp ?? trad;
};

// Matches only definitions that are simple single word enumerations
const SIMPLE_ENUMERATION = /^([a-z]+\s*,\s*)+[a-z]+\s*$/i;
const DEFINITION_COMMA_SPLIT = /\s*,\s*/;
const VARIANT_DEF = /^(?:old |archaic |erhua |Japanese |Taiwan )?variant of (.*)$/i;
// Counting words
const CL_DEF = /^CL:(.+)$/i;
type Definitions = { variantOf: string[]; countingWords: string[]; english: string[] };
const parseDefinitions = (item: WordEntryItem): Definitions => {
	// The Unicode source often contains a single definition containing multiple words
	// So we use a conservative heuristic here to split these on a best effort basis.
	// The regex must be so conservative, so that definitions like `to receive, as communications` don't get split
	const items = (item.definitions ?? []).flatMap((def) =>
		SIMPLE_ENUMERATION.test(def) ? def.trim().split(DEFINITION_COMMA_SPLIT) : [def]
	);

	const variantOf: string[] = [];
	const countingWords: string[] = [];
	const english: string[] = [];

	// TODO: Handle counting words
	items.forEach((it) => {
		const cl_match = it.match(CL_DEF);
		if (cl_match !== null) {
			const words = cl_match[1].split(',').map(parseCEDICTReference);
			countingWords.push(...words);
			return;
		}

		const reference = it.match(VARIANT_DEF);
		if (reference !== null) {
			variantOf.push(parseCEDICTReference(reference[1]));
			return;
		}

		english.push(it);
	});

	return { variantOf, countingWords, english };
};

const parseChar = (entry: Entry): StrokedHanzi | null => {
	if (isNonHskVariant(entry) || isTraditionalOnly(entry)) {
		return null;
	}

	// FIXME (Also for parseWord): maybe try to estimate the bookCharCountPercent if we fallback to charCountPercent,
	// by scaling it by the average factor?
	const charFrequency =
		entry.statistics?.bookCharCountPercent ?? entry.statistics?.movieCharCountPercent;
	if (charFrequency === undefined) {
		return null;
	}

	const wordFrequency =
		entry.statistics?.bookWordCountPercent ??
		entry.statistics?.movieWordCountPercent ??
		charFrequency;

	const pinyins =
		entry?.pinyinFrequencies?.map((it) => ({
			text: it.pinyin,
			frequency: it.count
		})) ?? [];
	pinyins.sort((a, b) => b.frequency - a.frequency);

	const sourceStrokeData =
		entry?.data ??
		entry?.images?.find((img) => img.type === 'Regular' && img.data !== undefined)?.data;
	const strokeData: StrokeData | undefined = sourceStrokeData && {
		strokes: sourceStrokeData.strokes,
		medians: sourceStrokeData.medians
	};

	const definitions = parseDefinitions({ definitions: entry.gloss ? [entry.gloss] : undefined });
	const variantOf = [
		...new Set([...definitions.variantOf, ...(entry.variantOf ? [entry.variantOf] : [])])
	];
	// Chars have no traditional / simplified information, that will be populated by `expandHanziWithWord`
	return {
		text: entry.char,
		wordFrequency,
		charFrequency,
		pinyins: nonEmpty(pinyins.map((it) => it.text)),
		english: nonEmpty(definitions.english),
		variantOf: nonEmpty(variantOf),
		characterHint: entry?.hint ?? '',
		hskLevel: mapHSK(entry?.statistics?.hskLevel),
		strokeData
	};
};

const combineDefinitions = (definitions: Definitions[]): Definitions => ({
	variantOf: [...new Set(definitions.flatMap((it) => it.variantOf))],
	countingWords: [...new Set(definitions.flatMap((it) => it.countingWords))],
	english: [...new Set(definitions.flatMap((it) => it.english))]
});

const FREQUENCY_FALLBACK_HSK_LEVEL = 1;
/** Words that are not part of the frequency corpora, but are common enough to be kept with an estimated frequency. */
const isFrequencyFallbackCandidate = (entry: WordEntry): boolean =>
	entry.statistics?.hskLevel === FREQUENCY_FALLBACK_HSK_LEVEL && Array.from(entry.simp).length > 1;

/** Known words are typically 10^-2 to 10^-3 times as frequent as their rarest character. */
const FALLBACK_FREQUENCY_FACTOR = 1e-3;
const estimateWordFrequency = (
	text: string,
	charFrequencies: Map<string, number>
): number | undefined => {
	const frequencies = Array.from(text, (char) => charFrequencies.get(char));
	if (!frequencies.every((it): it is number => it !== undefined)) {
		return undefined;
	}
	return Math.min(...frequencies) * FALLBACK_FREQUENCY_FACTOR;
};

const parseWord = (entry: WordEntry, wordFrequency: number): Word => {
	const pinyins = new Set(
		entry.items.flatMap((it) => (it.pinyin === undefined ? [] : [it.pinyin.replaceAll('​', ' ')]))
	);

	const preferredSource = 'cedict';
	const definitions = combineDefinitions(
		entry.items.filter((it) => it.source === preferredSource).map((it) => parseDefinitions(it))
	);
	if (definitions.english.length === 0) {
		definitions.english = combineDefinitions(
			entry.items.flatMap((it) => parseDefinitions(it))
		).english;
	}

	return {
		text: entry.simp,
		traditional: entry.trad === entry.simp ? undefined : [entry.trad],
		pinyins: nonEmpty([...pinyins]),
		english: nonEmpty(definitions.english),
		variantOf: nonEmpty(definitions.variantOf),
		countingWords: nonEmpty(definitions.countingWords),
		wordFrequency,
		hskLevel: mapHSK(entry.statistics?.hskLevel)
	};
};

const minIgnoringUndefined = (a: number | undefined, b: number | undefined): number | undefined =>
	a == undefined ? b : b == undefined ? a : Math.min(a, b);

const merge = <T>(
	lhs: NonEmpty<T> | undefined,
	rhs: NonEmpty<T> | undefined
): NonEmpty<T> | undefined =>
	lhs === undefined
		? rhs
		: rhs === undefined
			? undefined
			: nonEmpty([...new Set([...lhs, ...rhs])]);

// Sometimes words are duplicated and only differ in the traditional text.
// Their frequency statistics are the same, so the frequencies shouldn't be added.
const mergeWords = (lhs: Word, rhs: Word): Word => ({
	text: lhs.text,
	traditional: merge(lhs.traditional, rhs.traditional),
	pinyins: merge(lhs.pinyins, rhs.pinyins),
	english: merge(lhs.english, rhs.english),
	variantOf: merge(lhs.variantOf, rhs.variantOf),
	countingWords: merge(lhs.countingWords, rhs.countingWords),
	wordFrequency: Math.max(lhs.wordFrequency, rhs.wordFrequency),
	hskLevel: minIgnoringUndefined(lhs.hskLevel, rhs.hskLevel)
});

/**
 * Expands the hanzi character information with word definitions
 */
const expandHanziWithWord = (hanzi: StrokedHanzi, word: Word): StrokedHanzi => {
	return {
		...hanzi,
		traditional: merge(word.traditional, hanzi.traditional),
		english: merge(word.english, hanzi.english),
		variantOf: merge(word.variantOf, hanzi.variantOf),
		countingWords: merge(word.countingWords, hanzi.countingWords),
		wordFrequency: Math.max(hanzi.wordFrequency, word.wordFrequency)
	};
};

const removeSelfVariants = <T extends Common>(entry: T): T => ({
	...entry,
	variantOf: nonEmpty(
		entry.variantOf?.filter((it) => it !== entry.text && !entry.traditional?.includes(it)) ?? []
	)
});

const cleanupEnglish = (english: NonEmpty<string>): NonEmpty<string> | undefined => {
	const set = new Set(english);
	// Removes duplicate verbs like ['walk', 'to walk']
	const deduplicated = english
		.values()
		.filter((it) => !set.has(`to ${it}`))
		.toArray();
	return nonEmpty(deduplicated);
};

export default async (dictionaryPath: string): Promise<StrokedDictEntry[]> => {
	const chars: StrokedHanzi[] = [];
	const words: Map<string, Word> = new Map();
	const wordsWithoutFrequency: WordEntry[] = [];

	const addWord = (word: Word): void => {
		const existing = words.get(word.text);
		words.set(word.text, existing === undefined ? word : mergeWords(existing, word));
	};

	let lineNumber = 0;
	const startTime = performance.now();
	console.log('Processing wiktionary dump');
	await readLines(dictionaryPath, (line): void => {
		lineNumber += 1;
		if (!line) return;

		let entry: DictionaryEntry;
		try {
			entry = JSON.parse(line);
		} catch (e) {
			console.error(`length ${line.length}`);
			console.error(`head ${JSON.stringify(line.slice(0, 120))}`);
			console.error(`tail ${JSON.stringify(line.slice(-120))}`);
			throw new Error(`Unable to parse dictionary entry at line ${lineNumber}: ${e}`, { cause: e });
		}

		if ('char' in entry) {
			const hanzi = parseChar(entry);
			if (hanzi !== null) chars.push(hanzi);
		} else {
			const wordFrequency =
				entry.statistics?.bookWordCountPercent ?? entry.statistics?.movieWordCountPercent;
			if (wordFrequency !== undefined) {
				addWord(parseWord(entry, wordFrequency));
			} else if (isFrequencyFallbackCandidate(entry)) {
				wordsWithoutFrequency.push(entry);
			}
		}
	});

	const charFrequencies = new Map(chars.map((it) => [it.text, it.charFrequency]));
	const wordsWithFrequency = new Set(words.keys());
	wordsWithoutFrequency
		.filter((entry) => !wordsWithFrequency.has(entry.simp))
		.forEach((entry) => {
			const wordFrequency = estimateWordFrequency(entry.simp, charFrequencies);
			if (wordFrequency !== undefined) {
				addWord(parseWord(entry, wordFrequency));
			}
		});

	const combinedChars = chars.map((hanzi) => {
		const hanziWord = words.get(hanzi.text);
		if (hanziWord === undefined) return hanzi;
		return expandHanziWithWord(hanzi, hanziWord);
	});

	let entries = [
		...combinedChars.map((it): StrokedDictEntry => ({
			type: 'hanzi',
			...removeSelfVariants(it)
		})),
		...words
			.values()
			.filter((it) => Array.from(it.text).length > 1)
			.map((it): StrokedDictEntry => ({ type: 'word', ...removeSelfVariants(it) }))
	];
	entries = entries.map((entry) => ({
		...entry,
		english: entry.english ? cleanupEnglish(entry.english) : undefined
	}));
	entries.sort((a, b) => dictEntrySortFrequency(b) - dictEntrySortFrequency(a));

	console.log(`Finished in ${(performance.now() - startTime) / 1000} s`);
	console.log(`${entries.length} entries`);

	return entries;
};
