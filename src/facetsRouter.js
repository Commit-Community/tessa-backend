const { Router } = require("express");

const { collectionEnvelope, itemEnvelope } = require("./responseEnvelopes");
const { isAdmin } = require("./authMiddleware");
const { isNonWhitespaceOnlyString } = require("./validators");
const { listFacets, createFacet } = require("./facetsService");
const { UnprocessableEntityError } = require("./httpErrors");

const facetsRouter = new Router();

facetsRouter.get("/", async (req, res) => {
  const facets = await listFacets();
  res.json(collectionEnvelope(facets, facets.length));
});

facetsRouter.post("/", isAdmin, async (req, res, next) => {
  if (
    typeof req.body !== "object" ||
    !("name" in req.body) ||
    !("recommendation_prompt" in req.body) ||
    !("sort_order" in req.body)
  ) {
    next(
      new UnprocessableEntityError(
        "The request body must be an object with name, recommendation_prompt and sort_order properties."
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
    next(new UnprocessableEntityError(`"${name}" must contain text.`));
    return;
  }
  if (!isNonWhitespaceOnlyString(recommendationPrompt)) {
    next(
      new UnprocessableEntityError(
        `"${recommendationPrompt}" must contain text.`
      )
    );
    return;
  }
  if (!Number.isSafeInteger(sortOrder)) {
    next(new UnprocessableEntityError(`"${sortOrder}" must be an integer.`));
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
