import * as bcrypt from 'bcrypt'

import { schema, startOrInheritTransaction } from '../utils/index.js'
import BaseModel from './base.js'
import * as errors from '../errors.js'
import * as enums from '../enums.js'

/**
 * @typedef {import('objection').Transaction} Transaction
 */

const saltRounds = 10
const minPasswordLen = 8

export default class User extends BaseModel {
	static tableName = 'users'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'name',
				'hashed_password',
			],
			properties: {
				id: schema.primaryIndex,
				name: { type: 'string', maxLength: 255 },
				hashed_password: { type: 'string', maxLength: 128 },
				role: schema.userRole,
				created_at: schema.datetime,
				updated_at: schema.datetime,
				last_updated_at: schema.datetime,
			}
		}
	}

	/**
	 * @param {string} username
	 * @param {string} password
	 * @param {object} [opts={}]
	 * @param {enums.UserRole} [opts.role]
	 * @param {Transaction} [opts.trx]
	 * @returns {Promise<User>}
	 */
	static async create(username, password, opts = {}) {
		if (!username || !password) throw new Error('Missing username or password.')
		return await User.query(opts?.trx).insertAndFetch({
			name: username,
			hashed_password: await User.hashPassword(password),
			role: opts?.role,
		})
	}

	/**
	 * @param {string} password
	 * @returns {Promise<string>}
	 */
	static async hashPassword(password) {
		if (password.length < minPasswordLen) throw new errors.InvalidPasswordFormat(`Must have at least ${minPasswordLen} characters.`)
		return await bcrypt.hash(password, saltRounds)
	}

	/**
	 * @param {string} username
	 * @param {string} password
	 * @param {object} [opts={}]
	 * @param {Transaction} [opts.trx]
	 * @returns {Promise<User>}
	 */
	static async login(username, password, opts = {}) {
		await startOrInheritTransaction(async trx => {
			const user = await User.query(trx)
				.findOne({ name: username })
				.forUpdate()
			if (!user) throw new errors.UserNotFound(username)

			const pwCorrect = await user.verifyPassword(password)
			if (!pwCorrect) throw new errors.IncorrectPassword()

			return await user.$query(trx).patchAndFetch({ last_login_at: new Date() })
		}, opts?.trx)
	}

	/**
	 * @param {string} password
	 * @returns {Promise<bool>}
	 */
	async verifyPassword(password) {
		return await bcrypt.compare(password, this.hashed_password)
	}

	/**
	 * @param {enums.UserRole[]} roles
	 * @returns {boolean}
	 */
	async isRole(roles) {
		return roles.includes(this.role)
	}
}

BaseModel.User = User