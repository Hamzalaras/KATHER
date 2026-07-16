import { Router } from 'express';
import { defineOffset, defineLimit } from '../middleware/pagination.middleware.js';
import { defineId } from '../middleware/identity.middleware.js';
import { defineEra, defineCountry, defineGender, defineLineType, defineTopic, definePoemType, defineSea, defineQuafia } from '../middleware/catalog.middleware.js';
import { defineMeta, defineSearchQuery, defineSort } from '../middleware/meta.middleware.js';
import { getPoetById, getPoetPoems, getPoetsList, getPoetStats, getRandomPoet, getPoetLines } from '../controllers/poets.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { LINE_SEARCH_QUERY_MAX_LENGTH, POEM_SEARCH_QUERY_MAX_LENGTH, POET_SEARCH_QUERY_MAX_LENGTH } from '../constants/validation.js';
import { LINES_SORT, POEMS_SORT, POETS_SORT } from '../constants/sort.js';

const router = new Router();

router.get('/',
            catchWrapper(defineOffset()), catchWrapper(defineLimit()), catchWrapper(defineMeta()),
            catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
            catchWrapper(defineSearchQuery(POET_SEARCH_QUERY_MAX_LENGTH)), catchWrapper(defineSort(POETS_SORT)),
            catchWrapper(getPoetsList),
        );

router.get('/random',
            catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
            catchWrapper(defineSearchQuery(POET_SEARCH_QUERY_MAX_LENGTH)), catchWrapper(defineMeta()),
            catchWrapper(getRandomPoet),
        );

router.get('/:id/stats',
            catchWrapper(defineId('id', 'poet_id', true)),
            catchWrapper(getPoetStats),
        );

router.get('/:id/poems',
            catchWrapper(defineId('id', 'poet_id', true)),
            catchWrapper(defineOffset()), catchWrapper(defineLimit()), catchWrapper(defineSort(POEMS_SORT)),
            catchWrapper(defineTopic()), catchWrapper(definePoemType()), catchWrapper(defineSea()),
            catchWrapper(defineQuafia()), catchWrapper(defineSearchQuery(POEM_SEARCH_QUERY_MAX_LENGTH)),
            catchWrapper(getPoetPoems),
        );

router.get('/:id',
            catchWrapper(defineId('id', 'poet_id', true)),
            catchWrapper(getPoetById),
        );

router.get('/:id/lines',
            catchWrapper(defineId('id', 'poet_id', true)), catchWrapper(defineLimit()), catchWrapper(defineOffset()),
            catchWrapper(defineLineType()), catchWrapper(defineSort(LINES_SORT)),
            catchWrapper(defineSearchQuery(LINE_SEARCH_QUERY_MAX_LENGTH)),
            catchWrapper(getPoetLines),
        );

export default router;