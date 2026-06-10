import { Router } from 'express';
import { defineOffset, defineLimit } from '../middleware/pagination.js';
import { defineId } from '../middleware/identity.js';
import { defineEra, defineCountry, defineGender } from '../middleware/catalog.middleware.js';
import { defineMeta, defineSearchQuery, defineSort } from '../middleware/meta.middleware.js';
import { getPoetById, getPoetPoems, getPoetStats, getRandomPoetEndpoint, listPoets } from '../controllers/poet.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { POET_SEARCH_QUERY_MAX_LENGTH } from '../constants/validation.js';
import { POEMS_SORT, POETS_SORT } from '../constants/sort.js';

const router = new Router();

router.get('/',
            catchWrapper(defineOffset()), catchWrapper(defineLimit()), catchWrapper(defineMeta()),
            catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
            catchWrapper(defineSearchQuery(POET_SEARCH_QUERY_MAX_LENGTH)), catchWrapper(defineSort(POETS_SORT)),
            catchWrapper(listPoets),
        );

router.get('/random',
            catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
            catchWrapper(defineSearchQuery(POET_SEARCH_QUERY_MAX_LENGTH)),
            catchWrapper(getRandomPoetEndpoint),
        );

router.get('/:id/stats',
            catchWrapper(defineId('id', true)),
            catchWrapper(getPoetStats),
        );

router.get('/:id/poems',
            catchWrapper(defineId('id', true)),
            catchWrapper(defineOffset()), catchWrapper(defineLimit()), catchWrapper(defineSort(POEMS_SORT)),
            catchWrapper(getPoetPoems),
        );

router.get('/:id',
            catchWrapper(defineId('id', true)),
            catchWrapper(getPoetById),
        );


export default router;