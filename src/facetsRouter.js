const express = require("express");

const { collectionEnvelope, itemEnvelope } = require("./responseEnvelopes");
const { isAdmin } = require("./authMiddleware");
const { isNonWhitespaceOnlyString } = require("./validators");
const { listFacets, createFacet } = require("./facetsService");
const { UnprocessableEntityError } = require("./httpErrors");

const facetsRouter = express.Router();

facetsRouter.get("/", async (req, res, next) => {
  let facets;
  try {
    facets = await listFacets();
  } catch (e) {
    next(e);
    return;
  }
  res.json(collectionEnvelope(facets, facets.length));
});

facetsRouter.post("/", isAdmin(), async (req, res, next) => {
  if (
    typeof req.body !== "object" ||
    !("name" in req.body) ||
    !("recommendation_prompt" in req.body) ||
    !("sort_order" in req.body)
  ) {
    next(
      new UnprocessableEntityError(
        'The request body must be an object with "name", "recommendation_prompt" and "sort_order" properties.'
      )
    );
    return;
  }
  const {
    name,
    recommendation_prompt: recommendationPrompt,
    sort_order: sortOrder,
  } = req.body;
  if (!isNonWhitespaceOnlyString(name)) {
    next(new UnprocessableEntityError('"name" must contain text.'));
    return;
  }
  if (!isNonWhitespaceOnlyString(recommendationPrompt)) {
    next(
      new UnprocessableEntityError('"recommendation_prompt" must contain text.')
    );
    return;
  }
  if (!Number.isSafeInteger(sortOrder)) {
    next(new UnprocessableEntityError('"sort_order" must be an integer.'));
    return;
  }
  let facet;
  try {
    facet = await createFacet(name, recommendationPrompt, sortOrder);
  } catch (e) {
    next(e);
    return;
  }
  res.status(201).json(itemEnvelope(facet));
});

module.exports = facetsRouter;
