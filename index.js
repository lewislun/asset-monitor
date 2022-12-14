'use strict'

import * as lib from './lib/index.js'

const solanaRpcUrl = 'https://api.mainnet-beta.solana.com'

// Price scanners and aggregator
const priceAggregator = new lib.PriceAggregator()
priceAggregator.addPriceScanner(new lib.CoinGeckoPriceScanner())

const solanaNativeTokenScanner = new lib.SolanaNativeTokenScanner(priceAggregator, solanaRpcUrl)
const solanaSecondaryTokenScanner = new lib.SolanaSecondaryTokenScanner(priceAggregator, solanaRpcUrl)

const queryResults = await Promise.all([
	solanaNativeTokenScanner.query({ addr: 'AymfDSzZeeLK5Nf3wbghVxWLUwgFgfCFadsb1W2Yk7TE' }),
	// solanaSecondaryTokenScanner.query({ addr: 'AymfDSzZeeLK5Nf3wbghVxWLUwgFgfCFadsb1W2Yk7TE' }),
])
const assetResults = queryResults.flat()
for (let assetResult of assetResults) {
	lib.logger.info(JSON.stringify(assetResult, undefined, 2))
}

lib.logger.info("DONE")