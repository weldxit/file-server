const {Pool} = require('pg');

const pool = new Pool({
    user:"weldxit",
    host:"dpg-cl673s2uuipc73c8rrag-a.singapore-postgres.render.com",
    database:"quiver_6j4y",
    password:"6LOoZM5tZEB2xZJUDD9jCRu4Evq4sa21",
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
      }
});

module.exports = pool