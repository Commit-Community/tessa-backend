const { Router } = require("express");

const { collectionEnvelope, itemEnvelope } = require("./responseEnvelopes");
const { createReflection, listReflections } = require("./reflectionsService");
const { isValidId } = require("./validators");
const { UnprocessableEntityError } = require("./httpErrors");

const reflectionsRouter = new Router();

reflectionsRouter.get("/", async (req, res) => {
  const { userId } = req.session;
  const reflections = await listReflections(userId);
  res.json(collectionEnvelope(reflections, reflections.length));
});

reflectionsRouter.post("/", async (req, res, next) => {
  const { userId } = req.session;
  if (!("skill_id" in req.body) || !("statement_id" in req.body)) {
    next(
      new UnprocessableEntityError(
        "The request body must have skill_id and statement_id properties."
      )
    );
    return;
  }
  const skillId = Number(req.body.skill_id);
  if (!isValidId(skillId)) {
    next(
      new UnprocessableEntityError(
        `"${req.body.skill_id}" is not a valid skill id.`
      )
    );
    return;
  }
  const statementId = Number(req.body.statement_id);
  if (!isValidId(statementId)) {
    next(
      new UnprocessableEntityError(
        `"${req.body.statement_id}" is not a valid statement id.`
      )
    );
    return;
  }
  const reflection = await createReflection(userId, skillId, statementId);
  res.status(201).json(itemEnvelope(reflection));
});

module.exports = reflectionsRouter;
