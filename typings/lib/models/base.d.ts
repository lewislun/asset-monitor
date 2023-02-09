export default class BaseModel extends Model {
    /** @type {typeof import('./asset-flow').default} */
    static AssetFlow: typeof import('./asset-flow').default;
    /** @type {typeof import('./asset-group').default} */
    static AssetGroup: typeof import('./asset-group').default;
    /** @type {typeof import('./asset-snapshot').default} */
    static AssetSnapshot: typeof import('./asset-snapshot').default;
    /** @type {typeof import('./asset-snapshot-batch').default} */
    static AssetSnapshotBatch: typeof import('./asset-snapshot-batch').default;
    /** @type {typeof import('./asset-snapshot-tag').default} */
    static AssetSnapshotTag: typeof import('./asset-snapshot-tag').default;
}
import { Model } from "objection";
