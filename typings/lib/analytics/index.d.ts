/**
 * @typedef TotalValueData
 * @property {types.AssetCode} [code]
 * @property {types.Chain} [chain]
 * @property {enums.AssetType} [type]
 * @property {enums.AssetState} [state]
 * @property {string} [tagValue]
 * @property {Decimal} usdValue
 *
 *
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {'code'|'chain'|'group'|'tag'|'type'|'state'} [opts.groupBy]
 * @param {string} [opts.tagCategory] this is required of opts.groupBy === 'tag'
 * @returns {Promise<TotalValueData[]>}
 */
export function getTotalValue(opts?: {
    trx?: Transaction;
    groupBy?: 'code' | 'chain' | 'group' | 'tag' | 'type' | 'state';
    tagCategory?: string;
}): Promise<TotalValueData[]>;
export type Transaction = import('objection').Transaction;
export type TotalValueData = {
    code?: types.AssetCode;
    chain?: types.Chain;
    type?: enums.AssetType;
    state?: enums.AssetState;
    tagValue?: string;
    usdValue: Decimal;
};
import * as types from "../types.js";
import * as enums from "../enums.js";
import Decimal from "decimal.js";
