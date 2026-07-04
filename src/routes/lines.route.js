import { Router } from 'express';
import { defineLimit, defineOffset } from '../middleware/pagination.middleware.js';
import { defineId } from '../middleware/identity.middleware.js';
import { defineCountry, defineEra, defineGender, defineQuafia, defineSea, defineTopic, defineLineType, definePoemType } from '../middleware/catalog.middleware.js';
import { defineMeta, defineSearchQuery, defineSort } from '../middleware/meta.middleware.js';
import { getLineList, getLineById, getRandomLine } from '../controllers/lines.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS } from '../constants/domain.js';
import { LINES_LIST_LIMIT } from '../constants/pagination.js';
import { LINE_SEARCH_QUERY_MAX_LENGTH } from '../constants/validation.js';
import { LINES_SORT } from '../constants/sort.js';

const router = new Router();


router.get('/',
    catchWrapper(defineOffset()), catchWrapper(defineLimit(LINES_LIST_LIMIT)), catchWrapper(defineMeta()),
    catchWrapper(defineId('poetId', 'poet_id', false)), catchWrapper(defineId('poemId', 'poem_id', false)),catchWrapper(defineSort(LINES_SORT)),
    catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()), 
    catchWrapper(defineLineType()), catchWrapper(definePoemType()), catchWrapper(defineSearchQuery(LINE_SEARCH_QUERY_MAX_LENGTH)),
    catchWrapper(getLineList),
);

router.get('/random',
    catchWrapper(defineId('poetId', 'poet_id', false)), catchWrapper(defineId('poemId', 'poem_id', false)),
    catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()), 
    catchWrapper(defineLineType()), catchWrapper(definePoemType()), catchWrapper(defineSearchQuery(LINE_SEARCH_QUERY_MAX_LENGTH)),
    catchWrapper(getRandomLine),
);

router.get('/:id',
    catchWrapper(defineId('id', 'line_id', true)),
    catchWrapper(getLineById),
);


export default router;