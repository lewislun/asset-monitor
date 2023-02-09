/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {'code'|'chain'|'group'|'tag'|'type'|'state'} [opts.groupBy]
 * @param {string} [opts.tagCategory] this is required of opts.groupBy === 'tag'
 */
export function getTotalValue(opts?: {
    trx?: Transaction;
    groupBy?: 'code' | 'chain' | 'group' | 'tag' | 'type' | 'state';
    tagCategory?: string;
}): Promise<any[]>;
export type Transaction = import('objection').Transaction;
