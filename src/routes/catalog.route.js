import { Router } from 'express';
import { getCatalog, getEras, getCountries, getQuawafi, getSeas, getTopics, getPoemsTypes } from '../controllers/catalog.controller.js';
import { catchWrapper } from '../utils/catchWrapper.js';

const router = Router();

router.get('/', 
            catchWrapper(getCatalog)
        );
router.get('/eras', 
            catchWrapper(getEras)
        );
router.get('/countries', 
            catchWrapper(getCountries)
        );
router.get('/quawafi', 
            catchWrapper(getQuawafi)
        );
router.get('/seas', 
            catchWrapper(getSeas)
        );
router.get('/topics', 
            catchWrapper(getTopics)
        );
router.get('/poemsTypes',
            catchWrapper(getPoemsTypes)
        );

export default router;