module.exports = {
	apps : [{
		name: 'asset-monitor',
		script: 'node --require=suppress-experimental-warnings ./cli monitor \'0 * * * *\'',
		max_memory_restart: '256M',
		combine_logs: true,
	}],
}