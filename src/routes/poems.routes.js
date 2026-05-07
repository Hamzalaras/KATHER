import { Router } from 'express';
import { defineLimit, defineOffset } from '../middleware/pagination.js';
import { defineId } from '../middleware/identity.js';
import { defineEra, defineCountry, defineGender, defineQuafia, defineSea, defineTopic } from '../middleware/catalog.middleware.js';
import { defineSearchQuery } from '../middleware/poet.middleware.js';
import { definePoetId, definePoemType } from '../middleware/poem.middleware.js';
import { defineMeta } from '../middleware/meta.middleware.js';
import { getPoemList, getPoemById, getPoemLines, getPoemContext, getRandomPoemEndpoint } from '../controllers/poem.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';
import { DEFAULT_COUNT_TTL_SECONDS } from '../constants/cache.js';
import { ENTITY_KEYS } from '../constants/domain.js';
import { POEM_DETAIL_LINES_LIMIT, POEM_LINES_LIMIT, POEMS_LIST_LIMIT } from '../constants/pagination.js';

const router = new Router();

router.get('/',
    catchWrapper(defineLimit(POEMS_LIST_LIMIT)), catchWrapper(defineOffset()), catchWrapper(defineMeta()),
    catchWrapper(definePoetId()), catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()),
    catchWrapper(definePoemType()), catchWrapper(defineSearchQuery()),
    catchWrapper(getPoemList),
);

router.get('/random',
    catchWrapper(defineMeta()),
    catchWrapper(definePoetId()), catchWrapper(defineEra()), catchWrapper(defineCountry()), catchWrapper(defineGender()),
    catchWrapper(defineQuafia()), catchWrapper(defineSea()), catchWrapper(defineTopic()),
    catchWrapper(definePoemType()), catchWrapper(defineSearchQuery()),
    catchWrapper(getRandomPoemEndpoint),
);

router.get('/:id/context',
    catchWrapper(defineId(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS)),
    catchWrapper(getPoemContext),
);

router.get('/:id/lines',
    catchWrapper(defineId(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS)), catchWrapper(defineLimit(POEM_LINES_LIMIT)), catchWrapper(defineOffset()),
    catchWrapper(getPoemLines),
);

router.get('/:id',
    catchWrapper(defineId(ENTITY_KEYS.POEMS, DEFAULT_COUNT_TTL_SECONDS)), catchWrapper(defineLimit(POEM_DETAIL_LINES_LIMIT)), catchWrapper(defineOffset()),
    catchWrapper(getPoemById),
);

export default router;