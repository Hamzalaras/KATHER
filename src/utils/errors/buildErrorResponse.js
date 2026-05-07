import { ApiError } from './ApiError.js';
import { ERROR_CODES } from '../../constants/errors.js';
import { RESPONSE_STATUS } from '../../constants/http.js';

export const buildErrorResponse = (err, requestId, isDevelopment = false) => {
    const isApiError = err instanceof ApiError;
    const isOperational = isApiError ? err.isOperational : false;

    let statusCode = isApiError ? err.statusCode : 500;
    let errorCode = isApiError ? err.errorCode : ERROR_CODES.INTERNAL_SERVER_ERROR;
    let message = isApiError ? err.message : 'Internal server error';

    if (!isOperational) {
        statusCode = 500;
        errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
    }

    const payload = {
        status: RESPONSE_STATUS.ERROR,
        message,
        errors: [
            {
                code: errorCode,
                message,
            },
        ],
        requestId: requestId ?? null,
        timestamp: new Date().toISOString(),
    };

    return { statusCode, payload };
};