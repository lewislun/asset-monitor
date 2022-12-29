'use strict'

import Decimal from 'decimal.js'
import * as lib from './lib/index.js'

const solanaRpcUrl = 'https://rpc.ankr.com/solana'
const ethereumRpcUrl = 'https://rpc.ankr.com/eth'

// instantiate rate limiters
new lib.RateLimiter({ instanceKey: solanaRpcUrl, callPerSec: 100 })
new lib.RateLimiter({ instanceKey: ethereumRpcUrl, callPerSec: 100 })

// Price scanners and aggregator
const priceAggregator = new lib.PriceAggregator()
priceAggregator.addPriceScanner(new lib.CoinGeckoPriceScanner({ callPerSec: 10/60 }))

const solanaNativeTokenScanner = new lib.SolanaNativeTokenScanner(priceAggregator, solanaRpcUrl)
const solanaSecondaryTokenScanner = new lib.SolanaSecondaryTokenScanner(priceAggregator, solanaRpcUrl)
const orcaWhirlpoolScanner = new lib.OrcaWhirlpoolScanner(priceAggregator, solanaRpcUrl)
const ethereumNativeTokenScanner = new lib.EthereumNativeTokenScanner(priceAggregator, ethereumRpcUrl)
const ethereumSecondaryTokenScanner = new lib.EthereumSecondaryTokenScanner(priceAggregator, ethereumRpcUrl)

const queryResults = await Promise.all([
	solanaNativeTokenScanner.query({ addr: 'AymfDSzZeeLK5Nf3wbghVxWLUwgFgfCFadsb1W2Yk7TE' }),
	solanaNativeTokenScanner.query({ addr: 'JE2jJeRTyjV34oHhwMYVZaaQ5syeakFVbDGxcNzW9fsg' }),
	solanaSecondaryTokenScanner.query({ addr: 'AymfDSzZeeLK5Nf3wbghVxWLUwgFgfCFadsb1W2Yk7TE' }),
	solanaSecondaryTokenScanner.query({ addr: 'JE2jJeRTyjV34oHhwMYVZaaQ5syeakFVbDGxcNzW9fsg' }),
	orcaWhirlpoolScanner.query({ addr: 'AymfDSzZeeLK5Nf3wbghVxWLUwgFgfCFadsb1W2Yk7TE' }),
	ethereumNativeTokenScanner.query({ addr: '0xdADCBbC7163F46De908DeDF05a7DD68fA53c2311' }),
	ethereumSecondaryTokenScanner.query({ addr: '0xdADCBbC7163F46De908DeDF05a7DD68fA53c2311' }),
])
const assetResults = queryResults.flat()
let totalUSDValue = new Decimal(0)
for (let assetResult of assetResults) {
	// lib.logger.info(JSON.stringify(assetResult, undefined, 2))
	totalUSDValue = totalUSDValue.add(assetResult.usdValue)
}

lib.logger.info(`Total USD Value: $${totalUSDValue}`)
lib.logger.info("DONE")
process.exit(0)