/**
 * @typedef {import('objection').Transaction} Transaction
 */
/**
 * @param {Decimal.Value | BN} int
 * @param {number} decimals
 * @returns {Decimal}
 */
export function parseDecimal(int: Decimal.Value | BN, decimals: number): Decimal;
/**
 * @param {number} timeMs
 */
export function sleep(timeMs: number): Promise<void>;
/**
 * @param {enum} enumObj
 * @param {any} val
 * @returns {boolean}
 */
export function isEnumMember(enumObj: enum, val: any): boolean;
/**
 * @template T
 * @param {(trx: Transaction) => Promise<T>} func
 * @param {Transaction} [parentTrx]
 * @returns {Promise<T>}
 */
export function startOrInheritTransaction<T>(func: (trx: Transaction) => Promise<T>, parentTrx?: Transaction): Promise<T>;
/**
 * @param {object} obj This object will be altered.
 * @returns {object}
 */
export function rmUndefinedInObj(obj: object): object;
export type Transaction = import('objection').Transaction;
import Decimal from "decimal.js";
