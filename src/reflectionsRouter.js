const { Router } = require("express");

const { collectionEnvelope, itemEnvelope } = require("./responseEnvelopes");
const {
  createReflection,
  listReflections,
  findLatestReflectionForSkillFacet,
} = require("./reflectionsService");
const { isAuthenticated } = require("./authMiddleware");
const { isValidId } = require("./validators");
const { UnprocessableEntityError, BadRequestError } = require("./httpErrors");

const reflectionsRouter = new Router();

reflectionsRouter.get("/", isAuthenticated(), async (req, res, next) => {
  const { userId } = req.session;
  let reflections;
  try {
    reflections = await listReflections(userId);
  } catch (e) {
    next(e);
    return;
  }
  res.json(collectionEnvelope(reflections, reflections.length));
});

reflectionsRouter.get(
  "/latest/skills/:skillId/facets/:facetId",
  async (req, res, next) => {
    const { userId } = req.session;
    const { skillId, facetId } = req.params;
    const skillIdNumber = Number(skillId);
    if (!isValidId(skillIdNumber)) {
      next(new BadRequestError(`"${skillId}" is not a valid skill id.`));
      return;
    }
    const facetIdNumber = Number(facetId);
    if (!isValidId(facetIdNumber)) {
      next(new BadRequestError(`"${facetId}" is not a valid facet id.`));
      return;
    }
    let reflection;
    try {
      reflection = await findLatestReflectionForSkillFacet(
        userId,
        skillId,
        facetId
      );
    } catch (e) {
      next(e);
      return;
    }
    res.json(itemEnvelope(reflection));
  }
);

reflectionsRouter.post("/", isAuthenticated(), async (req, res, next) => {
  const { userId } = req.session;
  if (!("skill_id" in req.body) || !("statement_id" in req.body)) {
    next(
      new UnprocessableEntityError(
        'The request body must have "skill_id" and "statement_id" properties.'
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
  let reflection;
  try {
    reflection = await createReflection(userId, skillId, statementId);
  } catch (e) {
    next(e);
    return;
  }
  res.status(201).json(itemEnvelope(reflection));
});

module.exports = reflectionsRouter;
