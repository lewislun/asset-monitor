import moment from 'moment'
import { TelegramCommander, escapeMarkdownV2 as e } from 'telegram-commander'
import Decimal from 'decimal.js'

import { AssetGroup, AssetSnapshotBatch } from './models/index.js'
import * as analytics from './analytics/index.js'

/**
 * @typedef {import('./asset-monitor').default} AssetMonitor
 */

export default class AssetMonitorTelegramBot extends TelegramCommander {
	/**
	 * @param {AssetMonitor} assetMonitor
	 */
	async initAssetMonitorCommands(assetMonitor) {
		await this.addCommand({
			name: 'flow',
			description: 'Add asset flow record',
			handler: async (ctx) => {
				const groups = await AssetGroup.query()
				
				// get From group
				const fromGroupOptions = groups.map(group => [{ text: group.name, callback_data: group.id }])
				fromGroupOptions.push([{ text: 'None (in-flow record)', callback_data: '-1' }])
				const fromGroupMsg = await ctx.reply(e('From Group:'), { reply_markup: { inline_keyboard: fromGroupOptions } })
				const fromGroupQuery = await ctx.waitForCallbackQueryOnce(fromGroupMsg, { closeKeyboardOnDone: false })
				const fromGroup = groups.find(group => group.id === Number(fromGroupQuery.data))
				await this.bot.editMessageText(`From Group: ${fromGroup?.name ?? 'None (in-flow record)'}`, {
					message_id: fromGroupMsg.message_id,
					chat_id: ctx.chatId,
					reply_markup: {},
				})
				
				// get To group
				const toGroupOptions = groups.map(group => [{ text: group.name, callback_data: group.id }])
				toGroupOptions.push([{ text: 'None (out-flow record)', callback_data: '-1' }])
				const toGroupMsg = await ctx.reply(e('To Group:'), { reply_markup: { inline_keyboard: toGroupOptions } })
				const toGroupQuery = await ctx.waitForCallbackQueryOnce(toGroupMsg, { closeKeyboardOnDone: false })
				const toGroup = groups.find(group => group.id === Number(toGroupQuery.data))
				await this.bot.editMessageText(`To Group: ${toGroup?.name ?? 'None (out-flow record)'}`, {
					message_id: toGroupMsg.message_id,
					chat_id: ctx.chatId,
					reply_markup: {},
				})

				// reject if both groups are None or same
				if (!fromGroup && !toGroup) {
					throw new Error('Either fromGroup or toGroup must be specified.')
				} else if (fromGroup?.id === toGroup?.id) {
					throw new Error('fromGroup and toGroup cannot be the same.')
				}

				// get amount
				await ctx.reply(e('Amount (USD):'))
				const amountMsg = await ctx.waitForMessage()
				const amountStr = amountMsg.text

				if (!toGroup) {
					await ctx.reply(`Recording out\\-flow of *${e(amountStr)}* USD from *${e(fromGroup.name)}*\\.\\.\\.`)
				} else if (!fromGroup) {
					await ctx.reply(`Recording in\\-flow of *${e(amountStr)}* USD to *${e(toGroup.name)}*\\.\\.\\.`)
				} else {
					await ctx.reply(`Recording transfer of *${e(amountStr)}* USD from *${e(fromGroup.name)}* to *${e(toGroup.name)}*`)
				}
				const flow = await assetMonitor.recordFlow(fromGroup?.id, toGroup?.id, amountStr)
				await ctx.reply(e(`Asset flow recorded. invested value: ${flow.invested_usd_value}, actual value: ${flow.actual_usd_value}`))
			}
		})

		await this.addCommand({
			name: 'summary',
			description: 'Show summary',
			handler: async (ctx) => {
				const latestBatch = await AssetSnapshotBatch.getLatestBatch()
				if (!latestBatch) {
					await ctx.reply(e('No batch found.'))
					return
				}

				const totalValue = await latestBatch.getTotalValue()
				const investedValue = await analytics.getTotalInvestedValue()
				const highLow30Days = await analytics.getTotalValueHighLow({ fromDaysAgo: 30 })
				const totalPnl = await analytics.getTotalPnl()
				const pnlPercent = (totalValue.sub(investedValue).div(investedValue)).mul(100)

				await ctx.reply([
					`Last Scanned At: *${e(moment(latestBatch.scan_started_at).utcOffset('+08:00').toISOString())}*`,
					`Current Invested Value: *${e(investedValue)}* USD`,
					`Current USD Value: *${e(totalValue)}* USD`,
					`30 Days Range: *${e(highLow30Days.low.value.toString())}* \\- *${e(highLow30Days.high.value.toString())}* USD`,
					`Total Realized PnL: *${e(totalPnl.toString())}* USD`,
					`PnL%: *${e(pnlPercent.toDP(2).toString())}*%`,
				])
			}
		})

		await this.addCommand({
			name: 'assetpercentages',
			description: 'Show asset percentages',
			handler: async (ctx) => {
				const assetPercentages = await analytics.getAssetPercentages({})
				const assetByCode = {}
				const totalPercentageByCode = {}
				assetPercentages.forEach(row => {
					if (!assetByCode[row.code]) {
						assetByCode[row.code] = []
					}
					assetByCode[row.code].push(row)
					totalPercentageByCode[row.code] = (totalPercentageByCode[row.code] ?? new Decimal(0)).add(row.percentage)
				})

				// sort by total percentage
				let totalPercentages = []
				for (const code in totalPercentageByCode) {
					totalPercentages.push({ code, percentage: totalPercentageByCode[code] })
				}
				totalPercentages = totalPercentages.sort((a, b) => a.percentage.cmp(b.percentage))

				const rows = totalPercentages.map(row => {
					const assetRows = assetByCode[row.code]
						.sort((a, b) => a.usdValue.cmp(b.usdValue))
						.map(row => {
							return `\\- ${e(row.percentage.toDP(2))}% ${e(row.chain)} \\(${e(row.state)}\\)\\: ${e(row.usdValue.toDP(2))} USD`
						})
					return `*${e(row.code)}*: ${e(row.percentage.toDP(2))}%\n${assetRows.join('\n')}`
				})

				await ctx.reply(rows)
			}
		})

		await this.addCommand({
			name: 'scan',
			description: 'Scan assets',
			handler: async (ctx) => {
				await ctx.reply(e(`Scanning assets...`))
				const scanResult = await assetMonitor.scan()
				await ctx.reply(e(`Total USD Value: $${scanResult.totalUSDValue}`))
				await ctx.reply(e(`Storing results to DB - resultCount: ${scanResult.snapshots.length}`))
				const batch = await AssetSnapshotBatch.store(scanResult)
				await ctx.reply(e(`Results stored to DB - batchId: ${batch.id}`))
			}
		})

		await this.syncCommands()
	}
}