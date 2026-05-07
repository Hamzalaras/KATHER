const TRUTHY_VALUES = new Set(['true', '1', 'yes', 'on']);
const FALSY_VALUES = new Set(['false', '0', 'no', 'off']);

export const validateRequiredEnv = () => {

    const requiredVariables = ['DATABASE_URL'];
    const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

    if (missingVariables.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);

    }

};

export const parseTrustProxy = (value, defaultValue = 1) => {

    if (value === undefined || value === '') {
        return defaultValue;
    }



    const normalizedValue = String(value).trim().toLowerCase();

    if (TRUTHY_VALUES.has(normalizedValue)) return defaultValue;
    if (FALSY_VALUES.has(normalizedValue)) return false;

    const parsedValue = Number(value);
    if (Number.isInteger(parsedValue) && parsedValue >= 0) return parsedValue;


    throw new Error(`Invalid TRUST_PROXY value: ${value}. Use a non-negative integer or a boolean-like value.`);
};