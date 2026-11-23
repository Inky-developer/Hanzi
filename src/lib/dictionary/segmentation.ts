import { type Dictionary, textMatchLength } from '$lib/dictionary/dictionary';

type Edge = { successorIndex: number; cost: number };

type SegmentationGraph = {
	nodes: string[];
	edges: Edge[][];
};

export const buildSegmentationGraph = (dictionary: Dictionary, text: string): SegmentationGraph => {
	const nodes = Array.from(text);
	// End node, not included in the final output
	nodes.push('\0');
	const edges: Edge[][] = Array.from({ length: nodes.length }, () => []);

	nodes.forEach((_, index) => {
		// TODO: optimize
		const candidates = new Set(
			dictionary.entries.map((entry) => index + textMatchLength(entry.text, text.substring(index)))
		);
		if (index < nodes.length - 1) {
			candidates.add(index + 1);
		}
		candidates.delete(index);
		candidates.forEach((candidate) => {
			const text = nodes.slice(index, candidate).join('');
			// TODO: chars use charFrequency and words use wordFrequencies. We only care about wordFrequencies
			// The fallback is arbitrary. Any small value that works inside a log should be fine.
			const cost = Math.log(dictionary.lookup(text)?.frequency ?? 1e-15);
			edges[index].push({ successorIndex: candidate, cost: cost });
		});
	});

	return { nodes, edges };
};

const arrayOf = (n: number, value: number) => Array.from({ length: n }, () => value);

// Dynamic programming approach of calculating the best path to the last node
const computeCosts = (graph: SegmentationGraph): number[][] => {
	const costs: number[][] = [];
	for (let i = 0; i < graph.nodes.length; i++) {
		costs.push(arrayOf(graph.nodes.length, -Infinity));
		// Computes the best cost of the current column,
		// i.e. the best probability of getting to the current char
		// The first char has cost 0, because it is always reachable without any steps (base case)
		const bestCostSoFar = i === 0 ? 0 : Math.max(...costs.map((row) => row[i]));

		graph.edges[i].forEach((edge) => {
			costs.at(-1)![edge.successorIndex] = bestCostSoFar + edge.cost;
		});
	}

	return costs;
};

const indexOfMax = (row: number[]): number => {
	let maxIndex = 0;
	let maxValue = -Infinity;
	row.forEach((value, index) => {
		if (value > maxValue) {
			maxValue = value;
			maxIndex = index;
		}
	});
	return maxIndex;
};

// Goes through the matrix and finds the path with the maximum probability
const findPath = (costs: number[][]): number[] => {
	const path: number[] = [];
	let currentIndex = costs.length - 1;
	while (currentIndex !== 0) {
		const bestPredecessor = indexOfMax(costs.map((row) => row[currentIndex]));
		path.push(currentIndex);
		currentIndex = bestPredecessor;
	}
	return path.reverse();
};

const pathToSegments = (chars: string[], path: number[]): string[] => {
	const result: string[] = [];
	let currentIndex = 0;
	path.forEach((endIndex) => {
		result.push(chars.slice(currentIndex, endIndex).join(''));
		currentIndex = endIndex;
	});
	return result;
};

export const segmentText = (dictionary: Dictionary, text: string): string[] => {
	const graph = buildSegmentationGraph(dictionary, text);
	const costs = computeCosts(graph);
	const path = findPath(costs);
	return pathToSegments(graph.nodes, path);
};
