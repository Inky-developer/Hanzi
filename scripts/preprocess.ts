import { preprocess } from './lib/preprocess.ts';
import { existsSync, mkdirSync } from 'node:fs';
import { appendFile, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DICTIONARY_DIR = 'data/';
const HANZI_PATH = join(DICTIONARY_DIR, 'dictionary_char.jsonl');
const WORD_PATH = join(DICTIONARY_DIR, 'dictionary_word.jsonl');
const COMBINED_PATH = join(DICTIONARY_DIR, 'dictionary.jsonl');

const HANZI_URL = 'https://data.dong-chinese.com/dump/dictionary_char_2025-12-27.jsonl';
const WORD_URL = 'https://data.dong-chinese.com/dump/dictionary_word_2025-12-27.jsonl';

const downloadDict = async (url: string, path: string): Promise<void> => {
	if (existsSync(path)) {
		console.log(`Reusing dump at ${path}`);
		return;
	}

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Unable to download ${url}: ${response.status} ${response.statusText}`);
	}

	console.log(`Downloading dump to ${path}`);
	await writeFile(path, Buffer.from(await response.arrayBuffer()));
};

const combine = async () => {
	await copyFile(HANZI_PATH, COMBINED_PATH);
	await appendFile(COMBINED_PATH, await readFile(WORD_PATH));
	await Promise.all([HANZI_PATH, WORD_PATH].map((it) => rm(it)));
};

const downloadFullDictionary = async (): Promise<void> => {
	if (existsSync(COMBINED_PATH)) {
		console.log(`Reusing dump at ${COMBINED_PATH}`);
		return;
	}
	await mkdir(DICTIONARY_DIR);
	await Promise.all(
		[
			[HANZI_URL, HANZI_PATH],
			[WORD_URL, WORD_PATH]
		].map(([url, path]) => downloadDict(url, path))
	);
	await combine();
};

await downloadFullDictionary();
const words = await preprocess(COMBINED_PATH);
mkdirSync('src/lib/generated', { recursive: true });
await writeFile('src/lib/generated/data.json', JSON.stringify(words));
