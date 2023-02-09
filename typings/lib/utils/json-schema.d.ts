export namespace schema {
    namespace primaryIndex {
        const type: string;
    }
    namespace assetCode {
        const type_1: string;
        export { type_1 as type };
        export const maxLength: number;
    }
    namespace assetState {
        const type_2: string;
        export { type_2 as type };
        const _enum: string[];
        export { _enum as enum };
    }
    namespace assetType {
        const type_3: string;
        export { type_3 as type };
        const _enum_1: string[];
        export { _enum_1 as enum };
    }
    namespace assetTagCategory {
        const type_4: string;
        export { type_4 as type };
    }
    namespace chain {
        const type_5: string;
        export { type_5 as type };
        const maxLength_1: number;
        export { maxLength_1 as maxLength };
    }
    namespace decimal {
        const type_6: string[];
        export { type_6 as type };
    }
    namespace datetime {
        const type_7: string;
        export { type_7 as type };
        export const format: string;
    }
    namespace refId {
        const type_8: string;
        export { type_8 as type };
    }
}
export type JSONSchema = import('objection').JSONSchema;
