const mcache = require('memory-cache');

class CacheService {
    constructor() {
        this.ttl = (parseInt(process.env.CACHE_TTL) || 300) * 1000; // default 5 mins
    }

    get(key) {
        return mcache.get(key);
    }

    set(key, value, durationInMs) {
        mcache.put(key, value, durationInMs || this.ttl);
    }
}

module.exports = new CacheService();
