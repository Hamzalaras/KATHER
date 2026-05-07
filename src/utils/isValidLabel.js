

export const isValidLabel = (v) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim().toLowerCase();
    return  s !== 'undefined' && s !== 'غير محددة بعد';
};