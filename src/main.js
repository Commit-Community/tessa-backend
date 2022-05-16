const fs = require('fs');
const http = require('http');
const path = require('path');
const pg = require('pg');

const main = async (hostname, port, pgConfig) => {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSQL = await fs.promises.readFile(schemaPath, 'utf8');
  const db = new pg.Pool(pgConfig);
  await db.query(schemaSQL);
  const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end('{}');
  });
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
};

module.exports = main;
