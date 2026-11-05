import { preprocess } from './lib/preprocess.ts';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DICTIONARY_DIR = 'data/';
const DICTIONARY_PATH = join(DICTIONARY_DIR, 'dictionary_char.jsonl');
const CCDICT_PATH = join(DICTIONARY_DIR, 'ccd_char.u8');

const CCDICT_URL = 'https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip';
const CCDICT_ZIP_PATH = join(DICTIONARY_DIR, 'cedict.zip');
const CCDICT_ZIP_ENTRY = 'cedict_ts.u8';

const downloadCCDict = async (): Promise<void> => {
	if (existsSync(CCDICT_PATH)) {
		console.log(`Reusing CCDICT dump at ${CCDICT_PATH}`);
		return;
	}

	const response = await fetch(CCDICT_URL);
	if (!response.ok) {
		throw new Error(`Unable to download ${CCDICT_URL}: ${response.status} ${response.statusText}`);
	}

	console.log(`Downloading CC-CEDICT dump to ${CCDICT_PATH}`);
	await writeFile(CCDICT_ZIP_PATH, Buffer.from(await response.arrayBuffer()));
	execFileSync('unzip', ['-o', CCDICT_ZIP_PATH, CCDICT_ZIP_ENTRY, '-d', DICTIONARY_DIR]);
	await rename(join(DICTIONARY_DIR, CCDICT_ZIP_ENTRY), CCDICT_PATH);
	await rm(CCDICT_ZIP_PATH);
};

await downloadCCDict();
const words = await preprocess(DICTIONARY_PATH, CCDICT_PATH);
mkdirSync('src/lib/generated', { recursive: true });
await writeFile('src/lib/generated/data.json', JSON.stringify(words));
