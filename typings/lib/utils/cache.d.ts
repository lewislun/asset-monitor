/**
 * @typedef CacheOpts
 * @property {number} defaultTtlMs
 */
/**
 * @class
 * @template K, V
 */
export default class Cache<K, V> {
    /**
     * @param {CacheOpts} opts
     */
    constructor(opts?: CacheOpts);
    /** @type {Map<K, V>} */ dataMap: Map<K, V>;
    /** @type {Map<K, NodeJS.Timeout>} */ timeoutMap: Map<K, NodeJS.Timeout>;
    /** @type {number} */ defaultTtlMs: number;
    /**
     * @public
     * @param {K} key
     * @param {V} value
     * @param {number} [ttlMs]
     */
    public set(key: K, value: V, ttlMs?: number): void;
    /**
     * @public
     * @param {K} key
     * @returns {V}
     */
    public get(key: K): V;
    /**
     * @public
     * @param {K} key
     */
    public delete(key: K): void;
    /**
     * @public
     */
    public close(): void;
}
export type CacheOpts = {
    defaultTtlMs: number;
};
