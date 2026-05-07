import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import redoc from 'redoc-express';
import packageJson from '../package.json' with { type: 'json' };
import errorMiddleware from './middleware/error.middleware.js';
import { metricsMiddleware } from './middleware/metrics.js';
import { redisClient } from './utils/cache/redisClient.js';
import { parseTrustProxy } from './utils/environment.js';
import { RedisBackedRateLimitStore } from './utils/rateLimitStore.js';
import { ApiError } from './utils/errors/ApiError.js';
import { buildErrorResponse } from './utils/errors/buildErrorResponse.js';
import poetRouter from './routes/poet.routes.js';
import poemsRouter from './routes/poems.routes.js';
import lineRouter from './routes/line.routes.js';
import catalogRouter from './routes/catalog.routes.js';
import systemRouter from './routes/system.routes.js';
import metricsRouter from './routes/metrics.routes.js';
import { API_PREFIX_V1, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS, V1_RESOURCE_PATHS } from './constants/http.js';

const app = express();

app.disable('x-powered-by');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openapiPath = path.resolve(__dirname, '../openapi.yaml');
let openapiYaml = null;
let openapiSpec = null;

try {
  openapiYaml = fs.readFileSync(openapiPath, 'utf8');
  openapiSpec = YAML.parse(openapiYaml);
} catch (error) {
  console.warn('OpenAPI spec not found; documentation routes will be disabled.');
}

const ALLOWED_CORS_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return isLocalOrigin(origin);
  if (allowedOrigins.includes('*')) return true;

  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === origin) return true;

    if (allowedOrigin.startsWith('/') && allowedOrigin.endsWith('/')) {
      try {
        return new RegExp(allowedOrigin.slice(1, -1), 'i').test(origin);
      } catch {
        return false;
      }
    }

    return false;
  });
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    const error = new Error(`CORS origin not allowed: ${origin}`);
    error.statusCode = 403;
    callback(error);
  },
  methods: ALLOWED_CORS_METHODS,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-API-Version', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));

const rateLimitStore = new RedisBackedRateLimitStore(redisClient);


app.use(cors(corsOptions));
app.options('/:splat', cors(corsOptions));
app.use(helmet());
app.use(rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  store: rateLimitStore,
  passOnStoreError: true,
  handler: (req, res) => {
    const { statusCode, payload } = buildErrorResponse(
      new ApiError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED'),
      res.locals.requestId,
      false,
    );
    res.status(statusCode).json(payload);
  },
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(compression());
app.use(express.json());

app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-API-Version', packageJson.version);
  next();
});

app.use(metricsMiddleware);

if (openapiSpec) {
  app.get('/openapi.yaml', (req, res) => {
    res.setHeader('Content-Type', 'application/yaml');
    res.status(200).send(openapiYaml);
  });

  app.get('/openapi.json', (req, res) => {
    res.status(200).json(openapiSpec);
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      filter: true,
    },
  }));

  app.get('/redoc', redoc({
    title: 'Arabic Poetry API',
    specUrl: '/openapi.json',
  }));
}

app.use(systemRouter);
app.use(API_PREFIX_V1, systemRouter);
app.use(metricsRouter);
app.use(API_PREFIX_V1, metricsRouter);

app.use('/poets', poetRouter);
app.use(V1_RESOURCE_PATHS.POETS, poetRouter);
app.use('/poems', poemsRouter);
app.use(V1_RESOURCE_PATHS.POEMS, poemsRouter);
app.use('/lines', lineRouter);
app.use(V1_RESOURCE_PATHS.LINES, lineRouter);
app.use(V1_RESOURCE_PATHS.CATALOG, catalogRouter);
app.use('/catalog', catalogRouter);

app.use(errorMiddleware);
export default app;