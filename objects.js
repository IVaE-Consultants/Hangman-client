
export const setFields = (base) => (obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
    }, base);
};
