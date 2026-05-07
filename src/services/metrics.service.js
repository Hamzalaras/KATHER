import client from 'prom-client';
import { prismaClient } from '../database/prismaClient.js';

const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
});

export const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 1, 2, 5],
    registers: [register],
});

export const httpRequestsInFlight = new client.Gauge({
    name: 'http_requests_in_flight',
    help: 'In-flight HTTP requests',
    registers: [register],
});

export const cacheHits = new client.Counter({
    name: 'cache_hits_total',
    help: 'Cache hits',
    labelNames: ['cache'],
    registers: [register],
});

export const cacheMisses = new client.Counter({
    name: 'cache_misses_total',
    help: 'Cache misses',
    labelNames: ['cache'],
    registers: [register],
});

export const buildInfo = new client.Gauge({
    name: 'build_info',
    help: 'Build information',
    labelNames: ['version', 'name'],
    registers: [register],
});

export const setBuildInfo = (name, version) => {
    buildInfo.set({ name, version }, 1);
};

const gPoets = new client.Gauge({ name: 'arabic_poetry_poets_total', help: 'Total poets', registers: [register] });
const gPoems = new client.Gauge({ name: 'arabic_poetry_poems_total', help: 'Total poems', registers: [register] });
const gLines = new client.Gauge({ name: 'arabic_poetry_lines_total', help: 'Total lines', registers: [register] });

export const metrics = async () => {
    try {

        const [poets, poems, lines] = await Promise.all(
            [
                prismaClient.poets.count(),
                prismaClient.poems.count(),
                prismaClient.poemsLines.count(),
            ],
        );

        gPoets.set(poets);
        gPoems.set(poems);
        gLines.set(lines);

    } catch (e) {
        // ignore errors in metrics collection to avoid affecting API responses
    }

    return await register.metrics();
};

export default { register, metrics, setBuildInfo, httpRequestsTotal, httpRequestDuration, httpRequestsInFlight, cacheHits, cacheMisses };
