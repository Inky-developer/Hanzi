import { describe, expect, test } from 'vitest';
import { segmentText } from '$lib/dictionary/segmentation';
import { loadDictionary } from '$lib/dictionary/loadDictionary';

describe('segmentation', async () => {
	const dictionary = await loadDictionary(fetch);

	test('passes smoke tests', () => {
		expect(segmentText(dictionary, '研究生命起源')).toMatchInlineSnapshot(`
			[
			  "研究",
			  "生命",
			  "起源",
			]
		`);

		expect(segmentText(dictionary, '结婚的和尚未结婚的')).toMatchInlineSnapshot(`
			[
			  "结婚",
			  "的",
			  "和",
			  "尚未",
			  "结婚",
			  "的",
			]
		`);
	});

	test('handles whitespace', () => {
		expect(segmentText(dictionary, '我\n你')).toMatchInlineSnapshot(`
			[
			  "我",
			  "
			",
			  "你",
			]
		`);
	});

	test('handles disallow single token', () => {
		expect(segmentText(dictionary, '怎么样')).toMatchInlineSnapshot(`
			[
			  "怎么样",
			]
		`);
		expect(segmentText(dictionary, '怎么样', { allowSingleToken: false })).toMatchInlineSnapshot(`
			[
			  "怎么",
			  "样",
			]
		`);
	});

	test('handles short inputs', () => {
		expect(segmentText(dictionary, '')).toEqual([]);
		expect(segmentText(dictionary, 'a')).toEqual(['a']);
	});
});
