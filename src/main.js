const connectPgSimple = require("connect-pg-simple");
const cors = require("cors");
const express = require("express");
const expressSession = require("express-session");
const fs = require("fs");
const path = require("path");

const authRouter = require("./authRouter");
const db = require("./db");
const { handleNotFound, handleErrors } = require("./errorHandlers");
const rootRouter = require("./rootRouter");

const thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000;

const migrateSchema = async () => {
  const schemaPath = path.resolve(__dirname, "schema.sql");
  const schemaSQL = await fs.promises.readFile(schemaPath, "utf8");
  return db.query(schemaSQL);
};

const configureApp = (corsOrigin, sessionSecret) => {
  const app = express();
  app.use(express.json());
  app.use(cors({ credentials: true, origin: corsOrigin }));
  app.use(
    expressSession({
      cookie: { maxAge: thirtyDaysInMilliseconds, sameSite: true },
      name: "session_id",
      resave: true,
      saveUninitialized: true,
      secret: sessionSecret,
      store: new (connectPgSimple(expressSession))({ pool: db }),
    })
  );
  app.use("/", rootRouter);
  app.use("/auth", authRouter);
  app.use(handleNotFound);
  app.use(handleErrors);
  return app;
};

const main = async (hostname, port, corsOrigin, sessionSecret) => {
  await migrateSchema();
  const app = configureApp(corsOrigin, sessionSecret);
  return new Promise(resolve => {
    const server = app.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
      resolve(server);
    });
  });
};

module.exports = main;
