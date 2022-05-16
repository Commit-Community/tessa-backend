const main = require("./src/main");

const hostname = process.env.HOSTNAME;
const port = process.env.PORT;
const pgConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
};

main(hostname, port, pgConfig);
