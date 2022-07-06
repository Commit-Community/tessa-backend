const express = require("express");

const { isAuthor } = require("./authMiddleware");
const {
  UnprocessableEntityError,
  BadRequestError,
  NotFoundError,
} = require("./httpErrors");
const { isNonWhitespaceOnlyString, isValidId } = require("./validators");
const { itemEnvelope } = require("./responseEnvelopes");
const {
  createRecommendation,
  isRecommendationIdValid,
  updateRecommendation,
} = require("./recommendationsService");

const recommendationsRouter = express.Router();

recommendationsRouter.post("/", isAuthor(), async (req, res, next) => {
  const { userId } = req.session;
  if (
    typeof req.body !== "object" ||
    !("facet_id" in req.body) ||
    !("skill_id" in req.body) ||
    !("markdown" in req.body)
  ) {
    next(
      new UnprocessableEntityError(
        'The request body must be an object with "facet_id", "skill_id" and "markdown" properties.'
      )
    );
    return;
  }
  const { markdown } = req.body;
  if (!isNonWhitespaceOnlyString(markdown)) {
    next(new UnprocessableEntityError('"markdown" must contain text.'));
    return;
  }
  const facetId = Number(req.body.facet_id);
  if (!isValidId(facetId)) {
    next(new UnprocessableEntityError(`"${facetId}" is not a valid facet id.`));
    return;
  }
  const skillId = Number(req.body.skill_id);
  if (!isValidId(skillId)) {
    next(new UnprocessableEntityError(`"${skillId}" is not a valid skill id.`));
    return;
  }
  let recommendation;
  try {
    recommendation = await createRecommendation(
      markdown,
      skillId,
      facetId,
      userId
    );
  } catch (e) {
    next(e);
    return;
  }
  res.status(201).json(itemEnvelope(recommendation));
});

recommendationsRouter.put("/:id", isAuthor(), async (req, res, next) => {
  const { userId } = req.session;
  const { id } = req.params;
  const recommendationId = Number(id);
  if (!isValidId(recommendationId)) {
    next(new BadRequestError(`"${id}" is not a valid recommendation id.`));
    return;
  }
  let recommendationExists;
  try {
    recommendationExists = await isRecommendationIdValid(recommendationId);
  } catch (e) {
    next(e);
    return;
  }
  if (!recommendationExists) {
    next(
      new NotFoundError(
        `A recommendation with the id "${id}" could not be found.`
      )
    );
    return;
  }
  if (typeof req.body !== "object" || !("markdown" in req.body)) {
    next(
      new UnprocessableEntityError(
        'The request body must be an object with a "markdown" property.'
      )
    );
    return;
  }
  const { markdown } = req.body;
  if (!isNonWhitespaceOnlyString(markdown)) {
    next(new UnprocessableEntityError('"markdown" must contain text.'));
    return;
  }
  let recommendation;
  try {
    recommendation = await updateRecommendation(
      recommendationId,
      markdown,
      userId
    );
  } catch (e) {
    next(e);
    return;
  }
  res.json(itemEnvelope(recommendation));
});

module.exports = recommendationsRouter;
