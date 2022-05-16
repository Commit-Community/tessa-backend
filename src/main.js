const fs = require("fs");
const http = require("http");
const path = require("path");
const pg = require("pg");

const main = async (hostname, port, pgConfig) => {
  const db = new pg.Pool(pgConfig);
  try {
    const schemaPath = path.resolve(__dirname, "schema.sql");
    const schemaSQL = await fs.promises.readFile(schemaPath, "utf8");
    await db.query(schemaSQL);
  } catch (e) {
    console.log(`Failed to run database schema update. ${e}`);
  }
  const server = http.createServer(async (req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    try {
      await db.query("SELECT 1;");
      res.end('{"status":"connected"}');
    } catch (e) {
      res.end('{"status":"not connected"}');
    }
  });
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
};

module.exports = main;
