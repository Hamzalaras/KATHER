import { Router } from 'express';
import { defineLimit, defineOffset } from '../middleware/pagination.middleware.js';
import { defineId } from '../middleware/identity.middleware.js';
import { defineCountry, defineEra, defineGender, defineQuafia, defineSea, defineTopic, defineLineType, definePoemType } from '../middleware/catalog.middleware.js';
import { defineSearchQuery, defineSort } from '../middleware/meta.middleware.js';
import { getLineList, getLineById, getRandomLine } from '../controllers/lines.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';
import { LINES_LIST_LIMIT } from '../constants/pagination.js';
import { LINE_SEARCH_QUERY_MAX_LENGTH } from '../constants/validation.js';
import { LINES_SORT } from '../constants/sort.js';
import { defineBoolean } from '../middleware/boolean.middleware.js';
import { BOOLEAN_MIDDLEWARE } from '../constants/boolean.js';

const router = new Router();


router.get('/',
    catchWrapper(defineOffset()), catchWrapper(defineLimit(LINES_LIST_LIMIT)), catchWrapper(defineBoolean(BOOLEAN_MIDDLEWARE.META)),
    catchWrapper(defineId('poetId', 'poet_id', false)), catchWrapper(defineId('poemId', 'poem_id', false)),catchWrapper(defineSort(LINES_SORT)),
    catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()), 
    catchWrapper(defineLineType()), catchWrapper(definePoemType()), catchWrapper(defineSearchQuery(LINE_SEARCH_QUERY_MAX_LENGTH)),
    catchWrapper(defineBoolean(BOOLEAN_MIDDLEWARE.HAS_AUDIO)), catchWrapper(defineBoolean(BOOLEAN_MIDDLEWARE.HAS_EXPLANATION)),
    catchWrapper(getLineList),
);

router.get('/random',
    catchWrapper(defineId('poetId', 'poet_id', false)), catchWrapper(defineId('poemId', 'poem_id', false)),
    catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()), 
    catchWrapper(defineLineType()), catchWrapper(definePoemType()), catchWrapper(defineSearchQuery(LINE_SEARCH_QUERY_MAX_LENGTH)),
    catchWrapper(defineBoolean(BOOLEAN_MIDDLEWARE.HAS_AUDIO)), catchWrapper(defineBoolean(BOOLEAN_MIDDLEWARE.HAS_EXPLANATION)),
    catchWrapper(getRandomLine),
);

router.get('/:id',
    catchWrapper(defineId('id', 'line_id', true)),
    catchWrapper(getLineById),
);


export default router;