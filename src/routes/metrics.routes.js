import { Router } from 'express';
import metricsService from '../services/metrics.service.js';
import { ApiError } from '../utils/errors/ApiError.js';
import { buildErrorResponse } from '../utils/errors/buildErrorResponse.js';
import { ERROR_CODES } from '../constants/errors.js';

const router = Router();

const checkBasicAuth = (req) => {
    const user = process.env.METRICS_BASIC_AUTH_USER;
    const pass = process.env.METRICS_BASIC_AUTH_PASSWORD;
    if (!user || !pass) return true;

    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) return false;
    const payload = Buffer.from(auth.replace('Basic ', ''), 'base64').toString('utf8');
    return payload === `${user}:${pass}`;
};

router.get('/metrics', async (req, res) => {
    if (!checkBasicAuth(req)) {
        res.setHeader('WWW-Authenticate', 'Basic realm="metrics"');
        const { statusCode, payload } = buildErrorResponse(
            new ApiError('Unauthorized', 401, ERROR_CODES.UNAUTHORIZED),
            res.locals.requestId,
            false,
        );
        return res.status(statusCode).json(payload);
    }

    try {
        const body = await metricsService.metrics();
        res.setHeader('Content-Type', metricsService.register.contentType);
        res.status(200).send(body);
    } catch (e) {
        const { statusCode, payload } = buildErrorResponse(
            new ApiError('Failed to collect metrics', 500, ERROR_CODES.METRICS_ERROR),
            res.locals.requestId,
            false,
        );
        res.status(statusCode).json(payload);
    }
});

export default router;
