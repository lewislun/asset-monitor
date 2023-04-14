export default class RateLimiter {
    /** @type {Map<string, RateLimiter>} */ static instanceMap: Map<string, RateLimiter>;
    /**
     * Get an initialized RateLimiter by opts.instanceKey. If it does not exist, create one. This is useful for sharing RateLimiter if the same endpoint is used.
     *
     * @static
     * @public
     * @param {RateLimiterOpts} [opts={}]
     * @returns {RateLimiter}
     */
    public static getInstance(opts?: RateLimiterOpts): RateLimiter;
    /**
     * @param {RateLimiterOpts} [opts]
     */
    constructor(opts?: RateLimiterOpts);
    /** @type {string} */ instanceKey: string;
    /** @type {RateLimitedJob[]} */ queue: RateLimitedJob[];
    /** @type {number} */ callIntervalMs: number;
    /** @type {number} */ retryCount: number;
    /** @type {number} */ onErrPauseTimeMs: number;
    /** @type {number} */ timeoutMs: number;
    /** @type {boolean} */ isLoopRunning: boolean;
    /** @protected @type {NodeJS.Timeout} */ protected nextIteration: NodeJS.Timeout;
    /**
     * @public
     */
    public start(): void;
    /**
     * @protected
     */
    protected loop(): Promise<void>;
    /**
     * Stop the jobLoop. No-op if the loop is not running.
     *
     * @public
     */
    public stop(): void;
    /**
     * @public
     * @param {number} pauseTimeMs
     */
    public pause(pauseTimeMs: number): void;
    /**
     * @protected
     * @param {RateLimitedJob} job
     */
    protected processJob(job: RateLimitedJob): Promise<void>;
    /**
     * Accepts both sync and async functions.
     *
     * @public
     * @template T
     * @param {() => Promise<T>} func
     * @param {string} name
     * @returns {Promise<T>}
     */
    public exec<T>(func: () => Promise<T>, name?: string): Promise<T>;
}
/**
 * <T>
 */
export type RateLimitedJob = {
    name: string;
    func: () => T;
    callback: (T: any) => void;
    errCallback: (err: Error) => void;
    retryCount: number;
};
export type RateLimiterOpts = {
    callPerSec?: number;
    instanceKey?: string;
    retryCount?: number;
    onErrPauseTimeMs?: number;
};
