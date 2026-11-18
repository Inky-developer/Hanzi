import type { StrokeData } from '$lib/dictionary/types';
import type { Dictionary } from '$lib/dictionary/dictionary';

export class Strokes {
	constructor(private readonly strokes: StrokeData[]) {}

	lookup(dictionary: Dictionary, word: string): StrokeData | undefined {
		const index = dictionary.lookupHanzi(word)?.strokesIndex;
		if (index === undefined) {
			return undefined;
		}
		return this.strokes[index];
	}
}
