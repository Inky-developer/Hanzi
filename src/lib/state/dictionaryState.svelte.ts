import { Dictionary, EMPTY_DICTIONARY } from '$lib/dictionary/dictionary';

let dictionaryState = $state.raw(EMPTY_DICTIONARY);

export const dictionary = (): Dictionary => dictionaryState;

export const setDictionary = (dictionary: Dictionary) => {
	dictionaryState = dictionary;
};
