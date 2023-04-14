/**
 * @param {import('knex').Knex} knex
 */
export function refreshMaterializedViews(knex?: import('knex').Knex): Promise<void>;
export default class BaseModel extends Model {
    /** @type {typeof import('./asset-flow').default} */
    static AssetFlow: typeof import('./asset-flow').default;
    /** @type {typeof import('./asset-group').default} */
    static AssetGroup: typeof import('./asset-group').default;
    /** @type {typeof import('./asset-query').default} */
    static AssetQuery: typeof import('./asset-query').default;
    /** @type {typeof import('./asset-snapshot').default} */
    static AssetSnapshot: typeof import('./asset-snapshot').default;
    /** @type {typeof import('./asset-snapshot-batch').default} */
    static AssetSnapshotBatch: typeof import('./asset-snapshot-batch').default;
    /** @type {typeof import('./asset-snapshot-tag').default} */
    static AssetSnapshotTag: typeof import('./asset-snapshot-tag').default;
    /** @type {typeof import('./batch-list-view').default} */
    static BatchListView: typeof import('./batch-list-view').default;
    /** @type {typeof import('./summary_view').default} */
    static SummaryView: typeof import('./summary_view').default;
    /** @type {typeof import('./user').default} */
    static User: typeof import('./user').default;
}
import { Model } from "objection";
