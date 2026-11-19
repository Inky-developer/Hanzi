import type { KeyedStrokeData, StrokeData } from '$lib/dictionary/types';

export class Strokes {
	constructor(private readonly strokes: Map<string, StrokeData>) {}

	static fromStrokes(data: KeyedStrokeData[]) {
		const map = new Map<string, StrokeData>();
		data.forEach(({ char, ...stroke }) => map.set(char, stroke));
		return new Strokes(map);
	}

	lookup(word: string): StrokeData | undefined {
		return this.strokes.get(word);
	}
}
