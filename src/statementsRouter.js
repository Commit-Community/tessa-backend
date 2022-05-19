const { Router } = require("express");

const { collectionEnvelope } = require("./responseEnvelopes");
const { listStatements } = require("./statementsService");

const statementsRouter = new Router();

statementsRouter.get("/", async (req, res, next) => {
  let statements;
  try {
    statements = await listStatements();
  } catch (e) {
    next(e);
    return;
  }
  res.json(collectionEnvelope(statements, statements.length));
});

module.exports = statementsRouter;
