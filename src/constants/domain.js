export const ENTITY_KEYS = {
	POETS: 'poets',
	POEMS: 'poems',
	POEMS_LINES: 'poemsLines',
};

export const GENDERS = new Set([
	'male', 'female',
]);

export const LINE_TYPE_VALUES = new Set([
	1, 2, 3,
]);

export const UNSET_VALUES = new Set([
	'unset', 'null', 'undefined', 'false', '',
]);

export const META_VALUES = new Set([
	'full', 'all', 'true',
]);

export const RELATED_ITEMS_LIMIT = 5;
