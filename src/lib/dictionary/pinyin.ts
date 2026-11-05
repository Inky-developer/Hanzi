/** Converts e.g. "shì" to "shi" and "lǜ" to "lu". */
export const removeToneMarks = (pinyin: string): string =>
	pinyin
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
