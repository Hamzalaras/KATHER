import { Router } from 'express';
import { defineOffset, defineLimit } from '../middleware/pagination.js';
import { defineId } from '../middleware/identity.js';
import { defineEra, defineCountry, defineGender } from '../middleware/catalog.middleware.js';
import { defineSearchQuery, defineSort } from '../middleware/poet.middleware.js';
import { defineMeta } from '../middleware/meta.middleware.js';
import { getPoetById, getPoetPoems, getPoetStats, getRandomPoetEndpoint, listPoets } from '../controllers/poet.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS } from '../constants/domain.js';

const router = new Router();

router.get('/',
            catchWrapper(defineOffset()), catchWrapper(defineLimit()), catchWrapper(defineMeta()),
            catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
            catchWrapper(defineSearchQuery()), catchWrapper(defineSort()),
            catchWrapper(listPoets),
        );

router.get('/random',
            catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()), catchWrapper(defineMeta()),
            catchWrapper(defineSearchQuery()),
            catchWrapper(getRandomPoetEndpoint),
        );

router.get('/:id/stats',
            catchWrapper(defineId(ENTITY_KEYS.POETS, DEFAULT_COUNT_TTL_SECONDS)),
            catchWrapper(getPoetStats),
        );

router.get('/:id/poems',
            catchWrapper(defineId(ENTITY_KEYS.POETS, DEFAULT_COUNT_TTL_SECONDS)),
            catchWrapper(defineOffset()), catchWrapper(defineLimit()),
            catchWrapper(getPoetPoems),
        );

router.get('/:id',
            catchWrapper(defineId(ENTITY_KEYS.POETS, DEFAULT_COUNT_TTL_SECONDS)),
            catchWrapper(getPoetById),
        );


export default router;