'use strict'

import { PriceScannerType } from '../enums.js'
import BasePriceScanner from './base.js'
import CoinGeckoPriceScanner from './coin-gecko.js'
import LiveCoinWatchPriceScanner from './live-coin-watch.js'

/**
 * @type {object.<PriceScannerType, typeof BasePriceScanner>}
 */
export const ScannerClassByType = {
	[PriceScannerType.COIN_GECKO]: CoinGeckoPriceScanner,
	[PriceScannerType.LIVE_COIN_WATCH]: LiveCoinWatchPriceScanner,
}

export { default as BasePriceScanner } from './base.js'
export { default as CoinGeckoPriceScanner } from './coin-gecko.js'