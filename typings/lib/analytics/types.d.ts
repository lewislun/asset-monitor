declare const _default: {};
export default _default;
export type NetFlowData = {
    groupId: number;
    groupName: string;
    time: Date;
    usdValue: Decimal;
};
export type TotalValueData = {
    code?: types.AssetCode;
    chain?: types.Chain;
    type?: enums.AssetType;
    state?: enums.AssetState;
    tagValue?: string;
    usdValue: Decimal;
    percentage: Decimal;
};
import Decimal from "decimal.js";
import * as types from "../types.js";
import * as enums from "../enums.js";
