

const BASIC_SORT = [
    ['id', { id: 'asc' }],
    ['-id', { id: 'desc' }],
    ['created_at', { created_at: 'asc'}],
    ['-created_at', { created_at: 'desc'}],
];

const ORDER_SORT = [
    ['order', { order: 'asc' }],
    ['-order', { order: 'desc' }],
];

export const POETS_SORT = new Map([
    ...BASIC_SORT,
    ['eng_name', { engName: 'asc' }],
    ['-eng_name', { engName: 'desc' }],
    ['arab_name', { arabName: 'asc' }],
    ['-arab_name', { arabName: 'desc' }],
]);

export const POEMS_SORT = new Map([
    ...BASIC_SORT,
    ...ORDER_SORT,
    ['poet_id', { poetId: 'asc' }],
    ['-poet_id', { poetId: 'desc' }],

]);

export const LINES_SORT = new Map([
    ...BASIC_SORT,
    ...ORDER_SORT,
    ['poem_id', { poemId: 'asc' }],
    ['-poem_id', { poemId: 'desc' }],
]);