'use strict'

import Decimal from 'decimal.js'
import * as lib from './lib/index.js'

const solanaRpcUrl = 'https://api.mainnet-beta.solana.com'

// Price scanners and aggregator
const priceAggregator = new lib.PriceAggregator()
priceAggregator.addPriceScanner(new lib.CoinGeckoPriceScanner())

const solanaNativeTokenScanner = new lib.SolanaNativeTokenScanner(priceAggregator, solanaRpcUrl)
const solanaSecondaryTokenScanner = new lib.SolanaSecondaryTokenScanner(priceAggregator, solanaRpcUrl)

const queryResults = await Promise.all([
	solanaNativeTokenScanner.query({ addr: 'AymfDSzZeeLK5Nf3wbghVxWLUwgFgfCFadsb1W2Yk7TE' }),
	solanaNativeTokenScanner.query({ addr: 'JE2jJeRTyjV34oHhwMYVZaaQ5syeakFVbDGxcNzW9fsg' }),
	solanaSecondaryTokenScanner.query({ addr: 'AymfDSzZeeLK5Nf3wbghVxWLUwgFgfCFadsb1W2Yk7TE' }),
	solanaSecondaryTokenScanner.query({ addr: 'JE2jJeRTyjV34oHhwMYVZaaQ5syeakFVbDGxcNzW9fsg' }),
])
const assetResults = queryResults.flat()
let totalUSDValue = new Decimal(0)
for (let assetResult of assetResults) {
	lib.logger.info(JSON.stringify(assetResult, undefined, 2))
	totalUSDValue = totalUSDValue.add(assetResult.usdValue)
}

lib.logger.info(`Total USD Value: $${totalUSDValue}`)
lib.logger.info("DONE")