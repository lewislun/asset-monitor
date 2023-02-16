import { expect } from 'chai'
import { describe, it, before, after } from 'mocha'

import { setupDb, revertDb, knex } from './setup/index.js'
import * as lib from '../lib/index.js'
import Decimal from 'decimal.js'

before(setupDb)
after(revertDb)

describe('Analytics', function() {
	describe('getTotalValueOverTime()', function() {
		/** @type {import('knex').Knex.Transaction} */
		let trx
		let groups = []
		let batches = []

		before('insert mock data', async function() {
			this.timeout(10000)
			trx = await knex.transaction()
			// create groups
			groups = await lib.AssetGroup.query(trx).insertGraphAndFetch([
				{ name: 'cex' },
				{ name: 'chain-hub' },
			])

			// create batches
			batches[0] = await lib.AssetSnapshotBatch.query(trx).insertGraph({
				scan_started_at: new Date('2023-01-01'),
				scan_finished_at: new Date('2023-01-01'),
				total_usd_value: '54.8',
				snapshots: [
					{
						code: 'ABC',
						chain: 'some-cex',
						type: lib.AssetType.CEX_TOKEN,
						state: lib.AssetState.LIQUID,
						quantity: 1,
						usd_value: 0.5,
						usd_value_per_quantity: 0.5,
						captured_at: new Date(),
						group: { id: groups[0].id },
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
						captured_at: new Date(),
						group: { id: groups[0].id },
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
						captured_at: new Date(),
						group: { id: groups[1].id },
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
						captured_at: new Date(),
						group: { id: groups[1].id },
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
						captured_at: new Date(),
						group: { id: groups[1].id },
						tags: [{ category: 'risk-level', value: '1' }],
					},
				]
			}, { relate: true })
			batches[1] = await lib.AssetSnapshotBatch.query(trx).insertGraph({
				scan_started_at: new Date('2023-01-02'),
				scan_finished_at: new Date('2023-01-02'),
				total_usd_value: '42.8',
				snapshots: [
					{
						code: 'XYZ',
						chain: 'some-cex',
						type: lib.AssetType.CEX_TOKEN,
						state: lib.AssetState.LIQUID,
						quantity: 3,
						usd_value: 18,
						usd_value_per_quantity: 6,
						captured_at: new Date(),
						group: { id: groups[0].id },
						tags: [{ category: 'risk-level', value: '3' }],
					},
					{
						code: 'ABC',
						chain: 'abc-chain',
						type: lib.AssetType.NATIVE_TOKEN,
						state: lib.AssetState.LOCKED,
						quantity: 8,
						usd_value: 4,
						usd_value_per_quantity: 0.5,
						captured_at: new Date(),
						group: { id: groups[1].id },
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
						captured_at: new Date(),
						group: { id: groups[1].id },
						tags: [{ category: 'dummy', value: 'abc' }],
					},
					{
						code: 'XYZ',
						chain: 'xyz-chain',
						type: lib.AssetType.NATIVE_TOKEN,
						state: lib.AssetState.LIQUID,
						quantity: 0.5,
						usd_value: 12,
						usd_value_per_quantity: 24,
						captured_at: new Date(),
						group: { id: groups[1].id },
						tags: [{ category: 'risk-level', value: '1' }],
					},
				]
			}, { relate: true })
			batches[2] = await lib.AssetSnapshotBatch.query(trx).insertGraph({
				scan_started_at: new Date('2023-01-03'),
				scan_finished_at: new Date('2023-01-03'),
				total_usd_value: '42',
				snapshots: [
					{
						code: 'XYZ',
						chain: 'some-cex',
						type: lib.AssetType.CEX_TOKEN,
						state: lib.AssetState.LIQUID,
						quantity: 3,
						usd_value: 18,
						usd_value_per_quantity: 6,
						captured_at: new Date(),
						group: { id: groups[0].id },
						tags: [{ category: 'risk-level', value: '3' }],
					},
					{
						code: 'ABC',
						chain: 'abc-chain',
						type: lib.AssetType.NATIVE_TOKEN,
						state: lib.AssetState.LOCKED,
						quantity: 8,
						usd_value: 4,
						usd_value_per_quantity: 0.5,
						captured_at: new Date(),
						group: { id: groups[1].id },
						tags: [{ category: 'risk-level', value: '1' }],
					},
					{
						code: 'XYZ',
						chain: 'xyz-chain',
						type: lib.AssetType.NATIVE_TOKEN,
						state: lib.AssetState.LIQUID,
						quantity: 1,
						usd_value: 20,
						usd_value_per_quantity: 20,
						captured_at: new Date(),
						group: { id: groups[1].id },
						tags: [{ category: 'risk-level', value: '1' }],
					},
				]
			}, { relate: true })
		})

		after('rollback trx', async function() {
			this.timeout(10000)
			await trx.rollback()
		})

		it('gets without groupBy', async function() {
			const result = await lib.analytics.getTotalValueOverTime({ trx })
			expect(result).to.have.deep.members([
				[
					{ time: new Date('2023-01-01'), usdValue: new Decimal(54.8) },
					{ time: new Date('2023-01-02'), usdValue: new Decimal(42.8) },
					{ time: new Date('2023-01-03'), usdValue: new Decimal(42) },
				],
			])
		})

		it('gets by asset code', async function() {
			const result = await lib.analytics.getTotalValueOverTime({ trx, groupBy: 'code' })
			expect(result).to.have.deep.members([
				[
					{ time: new Date('2023-01-01'), code: 'ABC', usdValue: new Decimal(4) },
					{ time: new Date('2023-01-02'), code: 'ABC', usdValue: new Decimal(4) },
					{ time: new Date('2023-01-03'), code: 'ABC', usdValue: new Decimal(4) },
				],
				[
					{ time: new Date('2023-01-01'), code: 'DEF', usdValue: new Decimal(8.8) },
					{ time: new Date('2023-01-02'), code: 'DEF', usdValue: new Decimal(8.8) },
					{ time: new Date('2023-01-03'), code: 'DEF', usdValue: new Decimal(0) },
				],
				[
					{ time: new Date('2023-01-01'), code: 'XYZ', usdValue: new Decimal(42) },
					{ time: new Date('2023-01-02'), code: 'XYZ', usdValue: new Decimal(30) },
					{ time: new Date('2023-01-03'), code: 'XYZ', usdValue: new Decimal(38) },
				],
			])
		})

		it('gets by chain', async function() {
			const result = await lib.analytics.getTotalValueOverTime({ trx, groupBy: 'chain' })
			expect(result).to.have.deep.members([
				[
					{ time: new Date('2023-01-01'), chain: 'abc-chain', usdValue: new Decimal(12.3) },
					{ time: new Date('2023-01-02'), chain: 'abc-chain', usdValue: new Decimal(12.8) },
					{ time: new Date('2023-01-03'), chain: 'abc-chain', usdValue: new Decimal(4) },
				],
				[
					{ time: new Date('2023-01-01'), chain: 'some-cex', usdValue: new Decimal(36.5) },
					{ time: new Date('2023-01-02'), chain: 'some-cex', usdValue: new Decimal(18) },
					{ time: new Date('2023-01-03'), chain: 'some-cex', usdValue: new Decimal(18) },
				],
				[
					{ time: new Date('2023-01-01'), chain: 'xyz-chain', usdValue: new Decimal(6) },
					{ time: new Date('2023-01-02'), chain: 'xyz-chain', usdValue: new Decimal(12) },
					{ time: new Date('2023-01-03'), chain: 'xyz-chain', usdValue: new Decimal(20) },
				]
			])
		})

		it('gets by state', async function() {
			const result = await lib.analytics.getTotalValueOverTime({ trx, groupBy: 'state' })
			expect(result).to.have.deep.members([
				[
					{ time: new Date('2023-01-01'), state: lib.AssetState.LIQUID, usdValue: new Decimal(51.3) },
					{ time: new Date('2023-01-02'), state: lib.AssetState.LIQUID, usdValue: new Decimal(38.8) },
					{ time: new Date('2023-01-03'), state: lib.AssetState.LIQUID, usdValue: new Decimal(38) },
				],
				[
					{ time: new Date('2023-01-01'), state: lib.AssetState.LOCKED, usdValue: new Decimal(3.5) },
					{ time: new Date('2023-01-02'), state: lib.AssetState.LOCKED, usdValue: new Decimal(4) },
					{ time: new Date('2023-01-03'), state: lib.AssetState.LOCKED, usdValue: new Decimal(4) },
				]
			])
		})

		it('gets by type', async function() {
			const result = await lib.analytics.getTotalValueOverTime({ trx, groupBy: 'type' })
			expect(result).to.have.deep.members([
				[
					{ time: new Date('2023-01-01'), type: lib.AssetType.CEX_TOKEN, usdValue: new Decimal(36.5) },
					{ time: new Date('2023-01-02'), type: lib.AssetType.CEX_TOKEN, usdValue: new Decimal(18) },
					{ time: new Date('2023-01-03'), type: lib.AssetType.CEX_TOKEN, usdValue: new Decimal(18) },
				],
				[
					{ time: new Date('2023-01-01'), type: lib.AssetType.NATIVE_TOKEN, usdValue: new Decimal(9.5) },
					{ time: new Date('2023-01-02'), type: lib.AssetType.NATIVE_TOKEN, usdValue: new Decimal(16) },
					{ time: new Date('2023-01-03'), type: lib.AssetType.NATIVE_TOKEN, usdValue: new Decimal(24) },
				],
				[
					{ time: new Date('2023-01-01'), type: lib.AssetType.SECONDARY_TOKEN, usdValue: new Decimal(8.8) },
					{ time: new Date('2023-01-02'), type: lib.AssetType.SECONDARY_TOKEN, usdValue: new Decimal(8.8) },
					{ time: new Date('2023-01-03'), type: lib.AssetType.SECONDARY_TOKEN, usdValue: new Decimal(0) },
				]
			])
		})

		it('gets by group', async function() {
			const result = await lib.analytics.getTotalValueOverTime({ trx, groupBy: 'group' })
			expect(result).to.have.deep.members([
				[
					{ time: new Date('2023-01-01'), groupName: 'cex', usdValue: new Decimal(36.5) },
					{ time: new Date('2023-01-02'), groupName: 'cex', usdValue: new Decimal(18) },
					{ time: new Date('2023-01-03'), groupName: 'cex', usdValue: new Decimal(18) },
				],
				[
					{ time: new Date('2023-01-01'), groupName: 'chain-hub', usdValue: new Decimal(18.3) },
					{ time: new Date('2023-01-02'), groupName: 'chain-hub', usdValue: new Decimal(24.8) },
					{ time: new Date('2023-01-03'), groupName: 'chain-hub', usdValue: new Decimal(24) },
				],
			])
		})

		it('gets by tag', async function() {
			const result = await lib.analytics.getTotalValueOverTime({ trx, groupBy: 'tag', tagCategory: 'risk-level' })
			expect(result).to.have.deep.members([
				[
					{ time: new Date('2023-01-01'), tagValue: '1', usdValue: new Decimal(9.5) },
					{ time: new Date('2023-01-02'), tagValue: '1', usdValue: new Decimal(16) },
					{ time: new Date('2023-01-03'), tagValue: '1', usdValue: new Decimal(24) },
				],
				[
					{ time: new Date('2023-01-01'), tagValue: '3', usdValue: new Decimal(36.5) },
					{ time: new Date('2023-01-02'), tagValue: '3', usdValue: new Decimal(18) },
					{ time: new Date('2023-01-03'), tagValue: '3', usdValue: new Decimal(18) },
				],
				[
					{ time: new Date('2023-01-01'), tagValue: null, usdValue: new Decimal(8.8) },
					{ time: new Date('2023-01-02'), tagValue: null, usdValue: new Decimal(8.8) },
					{ time: new Date('2023-01-03'), tagValue: null, usdValue: new Decimal(0) },
				],
			])
		})

		it('throws error if tagCategory does not exist')
	})

	describe('getNetFlowOverTime()', function() {
		/** @type {import('knex').Knex.Transaction} */
		let trx
		let groups = []

		before('insert mock data', async function() {
			trx = await knex.transaction()

			// create groups
			groups = await lib.AssetGroup.query(trx).insertGraphAndFetch([
				{ name: 'group-1' },
				{ name: 'group-2' },
				{ name: 'group-3' },
			])

			// create flows
			await lib.AssetFlow.query(trx).insertGraph([
				{ executed_at: new Date('2023-01-02'), usd_value: 100, to_group_id: groups[0].id },
				{ executed_at: new Date('2023-01-03'), usd_value: 10, from_group_id: groups[0].id, to_group_id: groups[1].id },
				{ executed_at: new Date('2023-01-01'), usd_value: 5, to_group_id: groups[1].id },
				{ executed_at: new Date('2023-01-04'), usd_value: 50, from_group_id: groups[0].id, to_group_id: groups[2].id },
				{ executed_at: new Date('2023-01-05'), usd_value: 7, from_group_id: groups[2].id },
			])
		})

		after('rollback trx', async function() {
			await trx.rollback()
		})

		it('works', async function() {
			const result = await lib.analytics.getNetFlowOverTime({ trx })

			expect(result).to.have.deep.members([
				[
					{ groupId: groups[0].id, groupName: 'group-1', time: new Date('2023-01-02'), usdValue: new Decimal(100) },
					{ groupId: groups[0].id, groupName: 'group-1', time: new Date('2023-01-03'), usdValue: new Decimal(90) },
					{ groupId: groups[0].id, groupName: 'group-1', time: new Date('2023-01-04'), usdValue: new Decimal(40) },
				],
				[
					{ groupId: groups[1].id, groupName: 'group-2', time: new Date('2023-01-01'), usdValue: new Decimal(5) },
					{ groupId: groups[1].id, groupName: 'group-2', time: new Date('2023-01-03'), usdValue: new Decimal(15) },
				],
				[
					{ groupId: groups[2].id, groupName: 'group-3', time: new Date('2023-01-04'), usdValue: new Decimal(50) },
					{ groupId: groups[2].id, groupName: 'group-3', time: new Date('2023-01-05'), usdValue: new Decimal(43) },
				]
			])
		})
	})
})