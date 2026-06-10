import { Router } from 'express';
import { defineLimit, defineOffset } from '../middleware/pagination.js';
import { defineId } from '../middleware/identity.js';
import { defineCountry, defineEra, defineGender, defineQuafia, defineSea, defineTopic, defineLineType } from '../middleware/catalog.middleware.js';
import { defineMeta, defineSearchQuery, defineSort } from '../middleware/meta.middleware.js';
import { getLineList, getLineDetail, getRandomLineEndpoint } from '../controllers/line.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS } from '../constants/domain.js';
import { LINES_LIST_LIMIT } from '../constants/pagination.js';
import { LINE_SEARCH_QUERY_MAX_LENGTH } from '../constants/validation.js';
import { LINES_SORT } from '../constants/sort.js';

const router = new Router();


router.get('/',
    catchWrapper(defineOffset()), catchWrapper(defineLimit(LINES_LIST_LIMIT)), catchWrapper(defineMeta()),
    catchWrapper(defineId('poetId', false)), catchWrapper(defineSort(LINES_SORT)),
    catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()), 
    catchWrapper(defineLineType()), catchWrapper(defineSearchQuery(LINE_SEARCH_QUERY_MAX_LENGTH)),
    catchWrapper(getLineList),
);

router.get('/random',
    catchWrapper(defineId('poetId', false)),
    catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()), 
    catchWrapper(defineLineType()), catchWrapper(defineSearchQuery(LINE_SEARCH_QUERY_MAX_LENGTH)),
    catchWrapper(getRandomLineEndpoint),
);

router.get('/:id',
    catchWrapper(defineId('id', true)),
    catchWrapper(getLineDetail),
);


export default router;