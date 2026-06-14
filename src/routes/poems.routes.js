import { Router } from 'express';
import { defineLimit, defineOffset } from '../middleware/pagination.js';
import { defineId } from '../middleware/identity.js';
import { defineEra, defineCountry, defineGender, defineQuafia, defineSea, defineTopic, definePoemType } from '../middleware/catalog.middleware.js';
import { defineMeta, defineSort, defineSearchQuery } from '../middleware/meta.middleware.js';
import { getPoemById, getPoemContext, getPoemLines, getPoemList, getRandomPoem } from '../controllers/poem.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS } from '../constants/domain.js';
import { POEM_DETAIL_LINES_LIMIT, POEM_LINES_LIMIT, POEMS_LIST_LIMIT } from '../constants/pagination.js';
import { POEM_SEARCH_QUERY_MAX_LENGTH } from '../constants/validation.js';
import { LINES_SORT, POEMS_SORT } from '../constants/sort.js';

const router = new Router();

router.get('/',
    catchWrapper(defineLimit(POEMS_LIST_LIMIT)), catchWrapper(defineOffset()), catchWrapper(defineMeta()),
    catchWrapper(defineId('poetId', false)), catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()), catchWrapper(defineSort(POEMS_SORT)),
    catchWrapper(definePoemType()), catchWrapper(defineSearchQuery(POEM_SEARCH_QUERY_MAX_LENGTH)),
    catchWrapper(getPoemList),
);

router.get('/random',
    catchWrapper(defineId('poetId', false)), catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()), catchWrapper(defineLimit(POEM_DETAIL_LINES_LIMIT)),
    catchWrapper(definePoemType()), catchWrapper(defineSearchQuery(POEM_SEARCH_QUERY_MAX_LENGTH)),
    catchWrapper(getRandomPoem),
);

router.get('/:id/context',
    catchWrapper(defineId('id', true)),
    catchWrapper(getPoemContext),
);

router.get('/:id/lines',
    catchWrapper(defineId('id', true)), catchWrapper(defineLimit(POEM_LINES_LIMIT)), catchWrapper(defineOffset()),
    catchWrapper(defineSort(LINES_SORT)),
    catchWrapper(getPoemLines),
);

router.get('/:id',
    catchWrapper(defineId('id', true)), catchWrapper(defineLimit(POEM_DETAIL_LINES_LIMIT)), catchWrapper(defineOffset()),
    catchWrapper(getPoemById),
);

export default router;