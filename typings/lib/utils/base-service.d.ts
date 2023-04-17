/**
 * @abstract
 */
export default class BaseService {
    /** @protected @type {string[]} */ protected static requiredParamKeys: string[];
    /**
     * @param {ServiceParamDict} paramDict
     * @param {RateLimiterOpts} rateLimiterOpts
     */
    constructor(paramDict: ServiceParamDict, rateLimiterOpts: RateLimiterOpts);
    /** @protected @type {ServiceParamDict} */ protected paramDict: ServiceParamDict;
    /** @protected @type {RateLimiter} */ protected rateLimiter: RateLimiter;
    /** @protected @type {boolean} */ protected isInitialized: boolean;
    /** @protected @type {boolean} */ protected isClosed: boolean;
    /** @protected @type {Promise<void>} */ protected initPromise: Promise<void>;
    /** @private @type {function} */ private initPromiseResolve;
    /**
     * @public
     */
    public init(): Promise<void>;
    /**
     * @protected
     * @abstract
     */
    protected _init(): Promise<void>;
    /**
     * @public
     */
    public close(): Promise<void>;
}
export type RateLimiterOpts = import('rate-limiter').RateLimiterOpts;
export type ServiceParamDict = {
    rateLimiterKey?: string;
    endpoint?: string;
    apiKey?: string;
};
import RateLimiter from "rate-limiter";
