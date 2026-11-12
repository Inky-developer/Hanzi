import type { DictEntry, Hanzi, StrokeData, Word } from '../../src/lib/dictionary/types.ts';
import readLines from './readLines.ts';

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

type WordEntry = {
	_id: string;
	simp: string;
	trad: string;
	gloss: string;
	items: {
		source?: 'unicode' | 'cedict';
		pinyin?: string;
		simpTrad?: 'both';
		definitions?: string[];
	}[];
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
const mapHSK = (level: number | undefined): number | null => {
	if (level === undefined || level > MAX_HSK_LEVEL) {
		return null;
	}
	return level;
};

const parseChar = (entry: Entry): Hanzi | null => {
	if (isNonHskVariant(entry) || isTraditionalOnly(entry)) {
		return null;
	}

	const frequency = entry.statistics?.bookCharCountPercent ?? null;
	if (frequency === null) {
		return null;
	}

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

	return {
		text: entry.char,
		frequency,
		pinyins: pinyins.map((it) => it.text),
		english: [entry?.gloss ?? ''],
		characterHint: entry?.hint ?? '',
		originalMeaning: entry?.originalMeaning ?? '',
		hskLevel: mapHSK(entry?.statistics?.hskLevel),
		strokeData
	};
};

const parseWord = (entry: WordEntry): Word | null => {
	const frequency = entry.statistics?.bookWordCountPercent ?? null;
	if (frequency === null) {
		return null;
	}

	const pinyins = new Set(
		entry.items.flatMap((it) => (it.pinyin === undefined ? [] : [it.pinyin.replaceAll('​', ' ')]))
	);
	// TODO: Parse classifiers (number words, instead of stripping them)
	const english = new Set(
		entry.items.flatMap((it) => it.definitions ?? []).filter((it) => !it.startsWith('CL:'))
	);
	return {
		text: entry.simp,
		pinyins: [...pinyins],
		english: [...english],
		frequency,
		hskLevel: mapHSK(entry.statistics?.hskLevel)
	};
};

const minIgnoringNull = (a: number | null, b: number | null): number | null =>
	a == null ? b : b == null ? a : Math.min(a, b);

// Sometimes words are duplicated and only differ in the traditional text.
// Their frequency statistics are the same, so the frequencies shouldn't be added.
const mergeWords = (lhs: Word, rhs: Word): Word => ({
	text: lhs.text,
	pinyins: [...new Set([...lhs.pinyins, ...rhs.pinyins])],
	english: [...new Set([...lhs.english, ...rhs.english])],
	frequency: Math.max(lhs.frequency, rhs.frequency),
	hskLevel: minIgnoringNull(lhs.hskLevel, rhs.hskLevel)
});

/**
 * Expands the hanzi character information with word definitions
 */
const expandHanziWithWord = (hanzi: Hanzi, word: Word): Hanzi => {
	return {
		...hanzi,
		english: word.english ?? hanzi.english
	};
};

export default async (dictionaryPath: string): Promise<DictEntry[]> => {
	const chars: Hanzi[] = [];
	const words: Map<string, Word> = new Map();

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
			const word = parseWord(entry);
			if (word !== null) {
				const existing = words.get(word.text);
				words.set(word.text, existing === undefined ? word : mergeWords(existing, word));
			}
		}
	});

	const combinedChars = chars.map((hanzi) => {
		const hanziWord = words.get(hanzi.text);
		if (hanziWord === undefined) return hanzi;
		return expandHanziWithWord(hanzi, hanziWord);
	});

	const entries: DictEntry[] = [
		...combinedChars.map((it): DictEntry => ({ type: 'hanzi', item: it })),
		...words
			.values()
			.filter((it) => Array.from(it.text).length > 1)
			.map((it): DictEntry => ({ type: 'word', item: it }))
	];
	entries.sort((a, b) => b.item.frequency - a.item.frequency);

	console.log(`Finished in ${(performance.now() - startTime) / 1000} s`);
	console.log(`${entries.length} entries`);

	return entries;
};
