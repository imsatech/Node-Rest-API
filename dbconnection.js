var pg = require('pg')
var config = {
    user: 'postgres',
    database: 'demo',
    password: "demo",
    max: 10,
    idleTimeoutMillis: 30000
}
var pool = new pg.Pool(config)
module.exports = pool;