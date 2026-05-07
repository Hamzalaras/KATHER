import { buildErrorResponse } from '../utils/errors/buildErrorResponse.js';

const isDevelopment = process.env.NODE_ENV !== 'production';

const errorMiddleware = (err, req, res, next) => {
    const { statusCode, payload } = buildErrorResponse(err, res.locals.requestId, isDevelopment);

    if (isDevelopment) {
        console.error(err);
    }

    res.status(statusCode).json(payload);
};

export default errorMiddleware;
