import { Strokes } from '$lib/dictionary/strokes';

let strokesState = $state.raw(new Strokes([]));

export const strokes = (): Strokes => strokesState;

export const setStrokes = (strokes: Strokes) => {
	strokesState = strokes;
};
