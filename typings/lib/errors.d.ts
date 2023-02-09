export class InvalidAssetCodeError extends Error {
    /**
     * @param {any} code
     */
    constructor(code: any);
}
export class InvalidSecondaryTokenAddressError extends Error {
    /**
     * @param {string} addr
     */
    constructor(addr: string);
}
export class InvalidAssetScannerTypeError extends Error {
    /**
     * @param {any} type
     */
    constructor(type: any);
}
export class InvalidPriceScannerTypeError extends Error {
    /**
     * @param {any} type
     */
    constructor(type: any);
}
export class InvalidChainError extends Error {
    /**
     * @param {any} chain
     */
    constructor(chain: any);
}
export class NotImplementedError extends Error {
    /**
     * @param {string} extraMsg
     */
    constructor(extraMsg: string);
}
export class AssetScannerNotFoundError extends Error {
    /**
     * @param {string} name
     */
    constructor(name: string);
}
export class MissingParamError extends Error {
    /**
     * @param {string} serviceName
     * @param {string} paramKey
     */
    constructor(serviceName: string, paramKey: string);
}
export class NoDataError extends Error {
    constructor();
}
