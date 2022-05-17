const { Router } = require("express");

const { collectionEnvelope } = require("./responseEnvelopes");
const { listStatements } = require("./statementsService");

const statementsRouter = new Router();

statementsRouter.get("/", async (req, res) => {
  const statements = await listStatements();
  res.json(collectionEnvelope(statements, statements.length));
});

module.exports = statementsRouter;
