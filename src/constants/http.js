export const API_PREFIX_V1 = '/v1';

export const V1_RESOURCE_PATHS = {
	POETS: '/v1/poets',
	POEMS: '/v1/poems',
	LINES: '/v1/lines',
	CATALOG: '/v1/catalog',
};

export const RESPONSE_STATUS = {
	SUCCESS: 'success',
	ERROR: 'error',
};

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const RATE_LIMIT_MAX_REQUESTS = 100;
