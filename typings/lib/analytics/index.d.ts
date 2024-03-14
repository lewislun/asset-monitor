/**
 * @typedef {import('objection').Transaction} Transaction
 */
/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @returns {Promise<analyticsTypes.NetFlowData[][]>}
 */
export function getNetFlowOverTime(opts?: {
    trx?: Transaction;
}): Promise<analyticsTypes.NetFlowData[][]>;
/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {'code'|'chain'|'group'|'tag'|'type'|'state'} [opts.groupBy]
 * @param {string} [opts.tagCategory] this is required of opts.groupBy === 'tag'
 * @param {boolean} [opts.latestBatchOnly=false]
 * @returns {Promise<analyticsTypes.TotalValueData[][]>}
 */
export function getTotalValueOverTime(opts?: {
    trx?: Transaction;
    groupBy?: 'code' | 'chain' | 'group' | 'tag' | 'type' | 'state';
    tagCategory?: string;
    latestBatchOnly?: boolean;
}): Promise<analyticsTypes.TotalValueData[][]>;
/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {number[]} [opts.groupIds]
 * @returns {Promise<Decimal>}
 */
export function getTotalInvestedValue(opts?: {
    trx?: Transaction;
    groupIds?: number[];
}): Promise<Decimal>;
/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {number} [opts.daysAgo] if not provided, will return the latest total value
 * @returns {Promise<Decimal>}
 */
export function getLatestTotalValue(opts?: {
    trx?: Transaction;
    daysAgo?: number;
}): Promise<Decimal>;
/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {number} [opts.fromDaysAgo] if not provided, will get high/low of all time
 * @returns {Promise<{high: {time: Date, value: Decimal}, low: {time: Date, value: Decimal}}>}
 */
export function getTotalValueHighLow(opts?: {
    trx?: Transaction;
    fromDaysAgo?: number;
}): Promise<{
    high: {
        time: Date;
        value: Decimal;
    };
    low: {
        time: Date;
        value: Decimal;
    };
}>;
/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {number[]} [opts.groupIds]
 * @returns {Promise<Decimal>}
 */
export function getTotalPnl(opts?: {
    trx?: Transaction;
    groupIds?: number[];
}): Promise<Decimal>;
/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @returns {Promise<analyticsTypes.TotalValueData[]>}
 */
export function getAssetPercentages(opts?: {
    trx?: Transaction;
}): Promise<analyticsTypes.TotalValueData[]>;
export type Transaction = import('objection').Transaction;
import * as analyticsTypes from "./types.js";
import Decimal from "decimal.js";
