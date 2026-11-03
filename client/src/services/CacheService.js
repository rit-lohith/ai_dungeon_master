// Client-side cache for preventing repeated local API hits within same session
class CacheService {
    constructor() {
        this.cache = new Map();
    }
    
    get(key) {
        if (!this.cache.has(key)) return null;
        const { value, exp } = this.cache.get(key);
        if (Date.now() > exp) {
            this.cache.delete(key);
            return null;
        }
        return value;
    }
    
    set(key, value, ttlMs = 300000) {
        this.cache.set(key, { value, exp: Date.now() + ttlMs });
    }
}
export default new CacheService();
