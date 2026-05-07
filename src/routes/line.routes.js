import { Router } from 'express';
import { defineLimit, defineOffset } from '../middleware/pagination.js';
import { defineId } from '../middleware/identity.js';
import { defineCountry, defineEra, defineGender, defineQuafia, defineSea, defineTopic, defineLineType } from '../middleware/catalog.middleware.js';
import { defineSearchQuery, definePoetId } from '../middleware/poem.middleware.js';
import { defineMeta } from '../middleware/meta.middleware.js';
import { getLineList, getLineDetail, getRandomLineEndpoint } from '../controllers/line.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS } from '../constants/domain.js';
import { LINES_LIST_LIMIT } from '../constants/pagination.js';

const router = new Router();


router.get('/',
    catchWrapper(defineOffset()), catchWrapper(defineLimit(LINES_LIST_LIMIT)), catchWrapper(defineMeta()),
    catchWrapper(definePoetId()),
    catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()), 
    catchWrapper(defineLineType()), catchWrapper(defineSearchQuery()),
    catchWrapper(getLineList),
);

router.get('/random',
    catchWrapper(definePoetId()), catchWrapper(defineMeta()),
    catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()), 
    catchWrapper(defineLineType()), catchWrapper(defineSearchQuery()),
    catchWrapper(getRandomLineEndpoint),
);

router.get('/:id',
    catchWrapper(defineId(ENTITY_KEYS.POEMS_LINES, DEFAULT_COUNT_TTL_SECONDS)),
    catchWrapper(getLineDetail),
);


export default router;