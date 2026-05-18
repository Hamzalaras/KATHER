import { ARABIC_DIACRITICS_REGEX } from '../constants/regex.js';

export const hasDiacritics = (txt) => ARABIC_DIACRITICS_REGEX.test(txt);


export const stripDiacritics = (txt) => txt.replace(ARABIC_DIACRITICS_REGEX, '');