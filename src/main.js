const connectPgSimple = require("connect-pg-simple");
const cors = require("cors");
const express = require("express");
const expressSession = require("express-session");
const fs = require("fs");

const authRouter = require("./authRouter");
const db = require("./db");
const facetsRouter = require("./facetsRouter");
const { handleNotFound, handleErrors } = require("./errorHandlers");
const { isAuthenticated } = require("./authMiddleware");
const reflectionsRouter = require("./reflectionsRouter");
const rootRouter = require("./rootRouter");
const statementsRouter = require("./statementsRouter");
const skillsRouter = require("./skillsRouter");

const thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000;

const main = async ({
  corsOrigin,
  hostname,
  port,
  schemaPath,
  sessionSecret,
}) => {
  let schemaSQL;
  console.log("Reading schema file...");
  try {
    schemaSQL = await fs.promises.readFile(schemaPath, "utf8");
  } catch (e) {
    console.log(`Failed to read schema file. ${e}`);
    return;
  }
  console.log("Running schema migration...");
  try {
    await db.query(schemaSQL);
  } catch (e) {
    console.log(`Failed to run schema migration. ${e}`);
    return;
  }
  console.log("Configuring app...");
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
  app.use("/facets", facetsRouter);
  app.use("/reflections", isAuthenticated, reflectionsRouter);
  app.use("/statements", statementsRouter);
  app.use("/skills", skillsRouter);
  app.use(handleNotFound);
  app.use(handleErrors);
  return new Promise((resolve) => {
    console.log("Starting server...");
    const server = app.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
      resolve(server);
    });
  });
};

module.exports = main;
