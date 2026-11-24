export const ERROR_CODES = {
	INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
	POET_NOT_FOUND: 'POET_NOT_FOUND',
	POEM_NOT_FOUND: 'POEM_NOT_FOUND',
	LINE_NOT_FOUND: 'LINE_NOT_FOUND',
	EXPLANATION_NOT_FOUND: 'EXPLANATION_NOT_FOUND',
	AUDIO_NOT_FOUND: 'AUDIO_NOT_FOUND',
	REDIS_ERROR: 'REDIS_ERROR',
	UNAUTHORIZED: 'UNAUTHORIZED',
	METRICS_ERROR: 'METRICS_ERROR',
	RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
	OFFSET_EXCEEDS_TOTAL: 'OFFSET_EXCEEDS_TOTAL',
};

export const NOT_FOUND_MESSAGES = {
	POET: 'Poet not found',
	POEM: 'Poem not found',
	LINE: 'Line not found',
	EXPLANATION: 'Poem explanation not found',
	AUDIO: 'Poem audio not found',
	POET_NO_MATCH: 'No poet matched the provided filters',
	POEM_NO_MATCH: 'No poem matched the provided filters',
	LINE_NO_MATCH: 'No line matched the provided filters',
	OFFSET_NOT_FOUND: 'Offset exceeds total number of lines',
};
