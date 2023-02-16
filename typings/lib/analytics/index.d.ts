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
export type Transaction = import('objection').Transaction;
import * as analyticsTypes from "./types.js";
