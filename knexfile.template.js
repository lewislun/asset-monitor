const config = {
	client: 'pg',
	migrations: {
		directory: './db/migrations',
	},
	connection: {
		host: 'localhost',
		user: 'postgres',
		password: 'root',
		database: 'asset_monitor',
		port: 5432,
		timezone: '+00:00',
	},
}

export default config