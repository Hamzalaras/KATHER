

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
    ['name_en', { name_en: 'asc' }],
    ['-name_en', { name_en: 'desc' }],
    ['name_ar', { name_ar: 'asc' }],
    ['-name_ar', { name_ar: 'desc' }],
]);

export const POEMS_SORT = new Map([
    ...BASIC_SORT,
    ...ORDER_SORT,
    ['poet_id', { poet_id: 'asc' }],
    ['-poet_id', { poet_id: 'desc' }],

]);

export const LINES_SORT = new Map([
    ...BASIC_SORT,
    ...ORDER_SORT,
    ['poem_id', { poem_id: 'asc' }],
    ['-poem_id', { poem_id: 'desc' }],
]);