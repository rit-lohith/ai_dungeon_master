// Helper to safely parse localized fallbacks if API fails

export const safeParse = (data, fallback) => {
    try {
        return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
        return fallback;
    }
};
