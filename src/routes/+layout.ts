import type { LayoutLoad } from './$types';
import { resolve } from '$app/paths';

export const prerender = true;

export const load: LayoutLoad = async ({ fetch }) => {
	const commonHanzi: string[] = await fetch(resolve('/api/common_hanzi.json')).then((it) =>
		it.json()
	);
	return { commonHanzi };
};
