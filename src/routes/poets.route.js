import { Router } from 'express';
import { defineOffset, defineLimit } from '../middleware/pagination.middleware.js';
import { defineId } from '../middleware/identity.middleware.js';
import { defineEra, defineCountry, defineGender, defineLineType, defineTopic, definePoemType, defineSea, defineQuafia } from '../middleware/catalog.middleware.js';
import { defineSearchQuery, defineSort } from '../middleware/meta.middleware.js';
import { getPoetById, getPoetPoems, getPoetsList, getPoetStats, getRandomPoet, getPoetLines } from '../controllers/poets.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';
import { LINE_SEARCH_QUERY_MAX_LENGTH, POEM_SEARCH_QUERY_MAX_LENGTH, POET_SEARCH_QUERY_MAX_LENGTH } from '../constants/validation.js';
import { LINES_SORT, POEMS_SORT, POETS_SORT } from '../constants/sort.js';
import { defineBoolean } from '../middleware/boolean.middleware.js';
import { BOOLEAN_MIDDLEWARE } from '../constants/boolean.js';

const router = new Router();

router.get('/',
            catchWrapper(defineOffset()), catchWrapper(defineLimit()), catchWrapper(defineBoolean(BOOLEAN_MIDDLEWARE.META)),
            catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
            catchWrapper(defineSearchQuery(POET_SEARCH_QUERY_MAX_LENGTH)), catchWrapper(defineSort(POETS_SORT)),
            catchWrapper(getPoetsList),
        );

router.get('/random',
            catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
            catchWrapper(defineSearchQuery(POET_SEARCH_QUERY_MAX_LENGTH)), catchWrapper(defineBoolean(BOOLEAN_MIDDLEWARE.META)),
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