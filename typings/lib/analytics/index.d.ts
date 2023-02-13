/**
 * @typedef NetFlowOverTimeData
 * @property {number} groupId
 * @property {string} groupName
 * @property {{ time: Date, usdValue: Decimal }[]} timeline
 *
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @returns {Promise<NetFlowOverTimeData[]>}
 */
export function getNetFlowOverTime(opts?: {
    trx?: Transaction;
}): Promise<NetFlowOverTimeData[]>;
/**
 * @typedef TotalValueAnalyticsData
 * @property {types.AssetCode} [code]
 * @property {types.Chain} [chain]
 * @property {enums.AssetType} [type]
 * @property {enums.AssetState} [state]
 * @property {string} [tagValue]
 * @property {Decimal} usdValue
 *
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {'code'|'chain'|'group'|'tag'|'type'|'state'} [opts.groupBy]
 * @param {string} [opts.tagCategory] this is required of opts.groupBy === 'tag'
 * @returns {Promise<TotalValueAnalyticsData[]>}
 */
export function getTotalValue(opts?: {
    trx?: Transaction;
    groupBy?: 'code' | 'chain' | 'group' | 'tag' | 'type' | 'state';
    tagCategory?: string;
}): Promise<TotalValueAnalyticsData[]>;
export type Transaction = import('objection').Transaction;
export type NetFlowOverTimeData = {
    groupId: number;
    groupName: string;
    timeline: {
        time: Date;
        usdValue: Decimal;
    }[];
};
export type TotalValueAnalyticsData = {
    code?: types.AssetCode;
    chain?: types.Chain;
    type?: enums.AssetType;
    state?: enums.AssetState;
    tagValue?: string;
    usdValue: Decimal;
};
import Decimal from "decimal.js";
import * as types from "../types.js";
import * as enums from "../enums.js";
