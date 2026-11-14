export const groupByKey = <T, K>(items: T[], getKeys: (key: T) => K[]): Map<K, Set<T>> => {
	const groups = new Map<K, Set<T>>();
	items.forEach((it) => {
		const keys = getKeys(it);
		keys.forEach((key) => {
			if (!groups.has(key)) {
				groups.set(key, new Set());
			}
			groups.get(key)!.add(it);
		});
	});

	return groups;
};
