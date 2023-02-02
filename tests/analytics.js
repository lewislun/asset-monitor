import { expect } from 'chai'
import { describe, it, before, after } from 'mocha'

import { setupDb, revertDb, knex } from './setup/index.js'
import * as lib from '../lib/index.js'
import Decimal from 'decimal.js'

before(setupDb)
after(revertDb)

describe('Analytics', function() {
	describe('getTotalValue()', function() {
		/** @type {import('knex').Knex.Transaction} */
		let trx

		before('create snapshot batches', async function() {
			trx = await knex.transaction()

			const nowData = new Date().toISOString()
			await lib.AssetSnapshotBatch.query(trx).insertGraph({
				scan_started_at: nowData,
				scan_finished_at: nowData,
				total_usd_value: '100',
				snapshots: [
					{
						code: 'ABC',
						chain: 'some-cex',
						type: lib.AssetType.CEX_TOKEN,
						state: lib.AssetState.LIQUID,
						quantity: 1,
						usd_value: 0.5,
						usd_value_per_quantity: 0.5,
						captured_at: nowData,
						group: { '#id': 'cex', name: 'cex' },
						tags: [{ category: 'risk-level', value: '3' }],
					},
					{
						code: 'XYZ',
						chain: 'some-cex',
						type: lib.AssetType.CEX_TOKEN,
						state: lib.AssetState.LIQUID,
						quantity: 3,
						usd_value: 36,
						usd_value_per_quantity: 12,
						captured_at: nowData,
						group: { '#ref': 'cex' },
						tags: [{ category: 'risk-level', value: '3' }],
					},
					{
						code: 'ABC',
						chain: 'abc-chain',
						type: lib.AssetType.NATIVE_TOKEN,
						state: lib.AssetState.LOCKED,
						quantity: 7,
						usd_value: 3.5,
						usd_value_per_quantity: 0.5,
						captured_at: nowData,
						group: { '#id': 'chain-hub', name: 'chain-hub' },
						tags: [{ category: 'risk-level', value: '1' }],
					},
					{
						code: 'DEF',
						chain: 'abc-chain',
						type: lib.AssetType.SECONDARY_TOKEN,
						state: lib.AssetState.LIQUID,
						quantity: 8.8,
						usd_value: 8.8,
						usd_value_per_quantity: 1,
						captured_at: nowData,
						group: { '#ref': 'chain-hub' },
						tags: [{ category: 'dummy', value: 'abc' }],
					},
					{
						code: 'XYZ',
						chain: 'xyz-chain',
						type: lib.AssetType.NATIVE_TOKEN,
						state: lib.AssetState.LIQUID,
						quantity: 0.5,
						usd_value: 6,
						usd_value_per_quantity: 12,
						captured_at: nowData,
						group: { '#ref': 'chain-hub' },
						tags: [{ category: 'risk-level', value: '1' }],
					},
				]
			}, { allowRefs: true })
		})

		after('rollback trx', async function() {
			await trx.rollback()
		})

		it('gets without groupBy', async function() {
			const result = await lib.analytics.getTotalValue({ trx })
			expect(result).to.have.deep.members([
				{ usdValue: new Decimal(54.8) },
			])
		})

		it('gets by asset code', async function() {
			const result = await lib.analytics.getTotalValue({ trx, groupBy: 'code' })
			expect(result).to.have.deep.members([
				{ code: 'ABC', usdValue: new Decimal(4) },
				{ code: 'DEF', usdValue: new Decimal(8.8) },
				{ code: 'XYZ', usdValue: new Decimal(42) },
			])
		})

		it('gets by chain', async function() {
			const result = await lib.analytics.getTotalValue({ trx, groupBy: 'chain' })
			expect(result).to.have.deep.members([
				{ chain: 'abc-chain', usdValue: new Decimal(12.3) },
				{ chain: 'some-cex', usdValue: new Decimal(36.5) },
				{ chain: 'xyz-chain', usdValue: new Decimal(6) },
			])
		})

		it('gets by state', async function() {
			const result = await lib.analytics.getTotalValue({ trx, groupBy: 'state' })
			expect(result).to.have.deep.members([
				{ state: lib.AssetState.LIQUID, usdValue: new Decimal(51.3) },
				{ state: lib.AssetState.LOCKED, usdValue: new Decimal(3.5) },
			])
		})

		it('gets by type', async function() {
			const result = await lib.analytics.getTotalValue({ trx, groupBy: 'type' })
			expect(result).to.have.deep.members([
				{ type: lib.AssetType.CEX_TOKEN, usdValue: new Decimal(36.5) },
				{ type: lib.AssetType.NATIVE_TOKEN, usdValue: new Decimal(9.5) },
				{ type: lib.AssetType.SECONDARY_TOKEN, usdValue: new Decimal(8.8) },
			])
		})

		it('gets by group', async function() {
			const result = await lib.analytics.getTotalValue({ trx, groupBy: 'group' })
			expect(result).to.have.deep.members([
				{ groupName: 'cex', usdValue: new Decimal(36.5) },
				{ groupName: 'chain-hub', usdValue: new Decimal(18.3) },
			])
		})

		it('gets by tag', async function() {
			const result = await lib.analytics.getTotalValue({ trx, groupBy: 'tag', tagCategory: 'risk-level' })
			expect(result).to.have.deep.members([
				{ tagValue: '1', usdValue: new Decimal(9.5) },
				{ tagValue: '3', usdValue: new Decimal(36.5) },
				{ tagValue: null, usdValue: new Decimal(8.8) },
			])
		})

		it('throws error if tagCategory does not exist')
	})
})