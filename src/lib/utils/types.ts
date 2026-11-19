export type NonEmpty<T> = [T, ...T[]];

export const isNonEmpty = <T>(items: T[]): items is NonEmpty<T> => items.length > 0;

export const nonEmpty = <T>(items: T[]): NonEmpty<T> | undefined =>
	isNonEmpty(items) ? items : undefined;
