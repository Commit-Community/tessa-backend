const main = require("./src/main");
const path = require("path");

main({
  corsOrigin: process.env.WEBAPP_ORIGIN,
  hostname: process.env.HOSTNAME,
  port: process.env.PORT,
  schemaPath: path.resolve(__dirname, "src/schema.sql"),
  sessionSecret: process.env.SESSION_SECRET,
});
