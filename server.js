const main = require("./src/main");

main(
  process.env.HOSTNAME,
  process.env.PORT,
  process.env.WEBAPP_ORIGIN,
  process.env.SESSION_SECRET
);
