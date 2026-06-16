import { httpRequestsTotal, httpRequestDuration, httpRequestsInFlight } from '../services/metrics.service.js';

export const metricsMiddleware = (req, res, next) => {
    httpRequestsInFlight.inc();
    const endTimer = httpRequestDuration.startTimer({ method: req.method });

    let done = false;
    const cleanup = () => {
        if (done) return;
        done = true;

        const route = (req.baseUrl || '') + (req.route?.path ?? 'unknown');

        endTimer({ method: req.method, route, status: res.statusCode });
        httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode });
        httpRequestsInFlight.dec();
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);

    next();
};
