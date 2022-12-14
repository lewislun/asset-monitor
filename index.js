'use strict'

import { SolanaNativeTokenScanner, SolanaSecondaryTokenScanner } from './lib/asset-scanners/index.js'
import logger from './lib/logger.js'

const solanaRpcUrl = 'https://api.mainnet-beta.solana.com'

const solanaNativeTokenScanner = new SolanaNativeTokenScanner(solanaRpcUrl)
const solanaSecondaryTokenScanner = new SolanaSecondaryTokenScanner(solanaRpcUrl)

const assetResults = [
	...await solanaNativeTokenScanner.query({ addr: 'AymfDSzZeeLK5Nf3wbghVxWLUwgFgfCFadsb1W2Yk7TE' }),
	...await solanaSecondaryTokenScanner.query({ addr: 'AymfDSzZeeLK5Nf3wbghVxWLUwgFgfCFadsb1W2Yk7TE' }),
]

for (const result of assetResults) {
	logger.info(JSON.stringify(result, undefined, 2))
}

logger.info("DONE")