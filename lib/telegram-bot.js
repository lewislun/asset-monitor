import moment from 'moment'
import { TelegramCliBot, escapeMarkdownV2 } from 'telegram-cli-bot'

import { AssetFlow, SummaryView, AssetSnapshotBatch } from './models/index.js'

/**
 * @typedef {import('./asset-monitor').default} AssetMonitor
 */

export default class AssetMonitorTelegramBot extends TelegramCliBot {
	/**
	 * @param {AssetMonitor} assetMonitor
	 */
	initAssetMonitorCommands(assetMonitor) {
		this.addCommand({
			name: 'inflow',
			args: ['to-group', 'amount'],
			description: 'Add inflow record',
			handler: async (msg, _, toGroup, amountStr) => {
				await AssetFlow.recordFlow(undefined, toGroup, amountStr)
				await this.sendMessage(msg.chat.id, `Recorded inflow of *${amountStr}* USD to *${toGroup}*`)
			}
		})

		this.addCommand({
			name: 'summary',
			description: 'Show summary',
			handler: async (msg) => {
				const summary = await SummaryView.query().first()
				if (!summary) {
					throw new Error('No summary found')
				}
				await this.sendMessage(msg.chat.id, [
					`Last Scanned At: *${escapeMarkdownV2(moment(summary.last_scanned_at).utcOffset('+08:00').toISOString())}*`,
					`Total Inflow: *${escapeMarkdownV2(summary.total_inflow)}* USD`,
					`Total Outflow: *${escapeMarkdownV2(summary.total_outflow)}* USD`,
					`Net Inflow: *${escapeMarkdownV2(summary.net_inflow)}* USD`,
					`Current USD Value: *${escapeMarkdownV2(summary.current_usd_value)}* USD`,
					`1 Day Ago USD Value: *${escapeMarkdownV2(summary.one_day_ago_usd_value)}* USD`,
					`7 Days Ago USD Value: *${escapeMarkdownV2(summary.seven_day_ago_usd_value)}* USD`,
					`30 Days Ago USD Value: *${escapeMarkdownV2(summary.thirty_day_ago_usd_value)}* USD`,
					`30 Days Range: *${escapeMarkdownV2(summary.thirty_day_range)}*`,
					`PnL: *${escapeMarkdownV2(summary.pnl)}*%`,
				])
			}
		})

		this.addCommand({
			name: 'scan',
			description: 'Scan assets',
			handler: async (msg) => {
				await this.sendMessage(msg.chat.id, escapeMarkdownV2(`Scanning assets...`))
				const scanResult = await assetMonitor.scan()
				await this.sendMessage(msg.chat.id, escapeMarkdownV2(`Total USD Value: $${scanResult.totalUSDValue}`))
				await this.sendMessage(msg.chat.id, escapeMarkdownV2(`Storing results to DB - resultCount: ${scanResult.snapshots.length}`))
				const batch = await AssetSnapshotBatch.store(scanResult)
				await this.sendMessage(msg.chat.id, escapeMarkdownV2(`Results stored to DB - batchId: ${batch.id}`))
			}
		})
	}
}