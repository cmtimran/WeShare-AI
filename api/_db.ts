import { kv } from '@vercel/kv';
import Redis from 'ioredis';

// Helper to abstract DB differences and provide a unified client
export const getDb = () => {
    // Priority 1: Vercel KV (HTTP - Serverless native)
    if (process.env.KV_REST_API_URL) {
        return {
            get: async <T>(key: string): Promise<T | null> => kv.get(key),
            set: async (key: string, value: any, seconds?: number) => {
                if (seconds) return kv.set(key, value, { ex: seconds });
                return kv.set(key, value);
            },
            // List operations for History
            lpush: async (key: string, ...elements: any[]) => kv.lpush(key, ...elements),
            lrange: async <T>(key: string, start: number, stop: number): Promise<T[]> => kv.lrange(key, start, stop),
            del: async (key: string) => kv.del(key)
        };
    }

    // Priority 2: Generic Redis (TCP - Redis Labs, etc.)
    if (process.env.REDIS_URL) {
        // Note: In serverless, we might want to cache this connection if possible,
        // but for simplicity in Vercel Functions, creating new or relying on module cache is standard.
        // ioredis manages connections well.
        const redis = new Redis(process.env.REDIS_URL);
        return {
            get: async <T>(key: string): Promise<T | null> => {
                const val = await redis.get(key);
                try {
                    return val ? JSON.parse(val) : null;
                } catch (e) {
                    return val as unknown as T; // Fallback if string
                }
            },
            set: async (key: string, value: any, seconds?: number) => {
                const strVal = typeof value === 'string' ? value : JSON.stringify(value);
                if (seconds) {
                    await redis.set(key, strVal, 'EX', seconds);
                } else {
                    await redis.set(key, strVal);
                }
            },
            lpush: async (key: string, ...elements: any[]) => {
                // Redis lpush stores strings. We must stringify items if they are objects.
                const strElements = elements.map(e => typeof e === 'object' ? JSON.stringify(e) : e);
                return redis.lpush(key, ...strElements);
            },
            lrange: async <T>(key: string, start: number, stop: number): Promise<T[]> => {
                const res = await redis.lrange(key, start, stop);
                return res.map(item => {
                    try { return JSON.parse(item); } catch { return item; }
                }) as T[];
            },
            del: async (key: string) => redis.del(key)
        };
    }

    throw new Error("No database configured (Missing KV_REST_API_URL or REDIS_URL)");
};
