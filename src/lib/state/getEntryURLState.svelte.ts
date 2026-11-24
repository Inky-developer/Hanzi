import type { ResolvedPathname } from '$app/types';

type EntryURLResolver = (word: string) => ResolvedPathname;

let entryURLState: EntryURLResolver = $state.raw(() => {
	throw new Error('Entry URL state was not set');
});

export const getEntryURL = (word: string): ResolvedPathname => entryURLState(word);

export const setEntryURLState = (resolve: EntryURLResolver) => (entryURLState = resolve);
