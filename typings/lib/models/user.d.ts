export default class User extends BaseModel {
    /** @type {import('objection').JSONSchema} */
    static get jsonSchema(): import("objection").JSONSchema;
    /**
     * @param {string} username
     * @param {string} password
     * @param {object} [opts={}]
     * @param {enums.UserRole} [opts.role]
     * @param {Transaction} [opts.trx]
     * @returns {Promise<User>}
     */
    static create(username: string, password: string, opts?: {
        role?: enums.UserRole;
        trx?: Transaction;
    }): Promise<User>;
    /**
     * @param {string} password
     * @returns {Promise<string>}
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * @param {string} username
     * @param {string} password
     * @param {object} [opts={}]
     * @param {Transaction} [opts.trx]
     * @returns {Promise<User>}
     */
    static login(username: string, password: string, opts?: {
        trx?: Transaction;
    }): Promise<User>;
    /**
     * @param {string} password
     * @returns {Promise<bool>}
     */
    verifyPassword(password: string): Promise<bool>;
    /**
     * @param {enums.UserRole[]} roles
     * @returns {boolean}
     */
    isRole(roles: enums.UserRole[]): boolean;
}
export type Transaction = import('objection').Transaction;
import BaseModel from "./base.js";
import * as enums from "../enums.js";
