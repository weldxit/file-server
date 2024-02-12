const {Pool} = require('pg');

const pool = new Pool({
    user:"postgres",
    host:"localhost",
    database:"quiver",
    password:"12345",
    port: 5432,
    // ssl: {
    //     rejectUnauthorized: false,
    //   }
});

module.exports = pool