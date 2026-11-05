import readLines from './readLines.ts';
import { type Word } from '../../src/lib/dictionary/types.ts';

type Entry = {
	traditional: string;
	simplified: string;
	pinyin: string;
	english: string;
};

const ENTRY_PATTERN = /^(.+) (.+) \[(.+)] \/(.+)\/$/;
const parseEntry = (line: string): Entry => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_full, traditional, simplified, pinyin, english] = line.match(ENTRY_PATTERN)!;
	return { traditional, simplified, pinyin, english };
};

const TONE_MARKS: Record<string, string> = {
	a: 'āáǎà',
	e: 'ēéěè',
	i: 'īíǐì',
	o: 'ōóǒò',
	u: 'ūúǔù',
	ü: 'ǖǘǚǜ'
};

const toneMarkIndex = (letters: string): number => {
	const aOrE = letters.search(/[ae]/);
	if (aOrE !== -1) return aOrE;
	if (letters.includes('ou')) return letters.indexOf('o');
	return letters.search(/[aeiouü](?!.*[aeiouü])/);
};

const addToneMark = (syllable: string): string => {
	const match = /^([a-zü]+)([1-5])$/.exec(syllable);
	if (!match) return syllable;

	const [, letters, tone] = match;
	const index = toneMarkIndex(letters);
	if (tone === '5' || index === -1) return letters;

	const markedVowel = TONE_MARKS[letters[index]][Number(tone) - 1];
	return letters.slice(0, index) + markedVowel + letters.slice(index + 1);
};

/** Converts CC-CEDICT pinyin like "ni3 hao3" to the tone mark format of the hanzi data, e.g. "nǐ hǎo". */
const normalizePinyin = (pinyin: string): string =>
	pinyin.toLowerCase().replaceAll('u:', 'ü').split(' ').map(addToneMark).join(' ');

export default async (path: string): Promise<Word[]> => {
	const words: Word[] = [];

	await readLines(path, (line) => {
		if (line.startsWith('#')) {
			return;
		}

		const entry = parseEntry(line);
		const pinyin = normalizePinyin(entry.pinyin);
		words.push({ hanzi: Array.from(entry.simplified), english: entry.english, pinyin });
	});

	return words;
};
