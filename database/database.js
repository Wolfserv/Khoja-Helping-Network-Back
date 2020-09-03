const {Pool} = require('pg');
require('dotenv');

const client = new Pool({
    user: 'khoja_help_dev',
    host: 'localhost',
    database: 'helping_network',
    password: '.1Connect#####',
    port: 5432
});

module.exports = {
    client : client
};