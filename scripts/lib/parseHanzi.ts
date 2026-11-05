import { type Hanzi } from '../../src/lib/dictionary/types.ts';
import readLines from './readLines.ts';

type Source = 'unicode' | 'academia-sinica' | 'makemeahanzi' | 'baxter-sagart' | 'dong-chinese';

type StrokeData = {
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
	data?: StrokeData;
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

type CharacterEntry = {
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
	data?: (StrokeData & { character?: string }) | null;
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
		pinyin: string;
		simpTrad?: 'both';
		definitions: string[];
	}[];
	pinyinSearchString: string;
	statistics?: CharacterStatistics;
};

type DictionaryEntry = CharacterEntry | WordEntry;

/** Some common characters like 更 are marked as variants of obscure forms, so HSK characters are kept. */
const isNonHskVariant = (entry: CharacterEntry): boolean =>
	entry.variantOf !== undefined && entry.statistics?.hskLevel === undefined;

/** Characters like 后 list themselves as their own simplified form and are kept. */
const isTraditionalOnly = (entry: CharacterEntry): boolean =>
	entry.simpVariants !== undefined && !entry.simpVariants.includes(entry.char);

export default async (dictionaryPath: string): Promise<Hanzi[]> => {
	const result: Hanzi[] = [];

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
			throw new Error(`Unable to parse Wiktionary entry at line ${lineNumber}: ${e}`, { cause: e });
		}

		if (!('char' in entry) || isNonHskVariant(entry) || isTraditionalOnly(entry)) {
			return;
		}

		const frequency = entry.statistics?.bookCharCount ?? null;
		if (frequency === null) {
			return;
		}

		const pinyins =
			entry?.pinyinFrequencies?.map((it) => ({
				text: it.pinyin,
				frequency: it.count
			})) ?? [];
		pinyins.sort((a, b) => b.frequency - a.frequency);

		// if (frequency !== null && frequency == 2615490) {
		// 	console.log(entry);
		// }

		result.push({
			symbol: entry.char,
			frequency,
			pinyins: pinyins.map((it) => it.text),
			english: entry?.gloss ?? '',
			characterHint: entry?.hint ?? '',
			hskLevel: entry?.statistics?.hskLevel ?? null
		});
	});

	result.sort((a, b) => b.frequency - a.frequency);

	console.log(`Finished in ${(performance.now() - startTime) / 1000} s`);
	console.log(`${result.length} entries`);

	return result;
};
