import { ERROR_CODES } from '../../constants/errors.js';

export class ApiError extends Error {
    constructor(message, statusCode = 500, errorCode = ERROR_CODES.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        this.errorCode = errorCode;
        this.isOperational = isOperational;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class ValidationError extends ApiError {
    constructor(message = 'Validation failed', errorCode = 'VALIDATION_FAILED') {
        super(message, 400, errorCode, true);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
        super(message, 404, errorCode, true);
    }
}

export class RedisError extends ApiError {
    constructor(message = 'Redis operation failed', errorCode = ERROR_CODES.REDIS_ERROR) {
        super(message, 503, errorCode, true);
    }
}
