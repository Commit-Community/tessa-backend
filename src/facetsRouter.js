const { Router } = require("express");

const { collectionEnvelope } = require("./responseEnvelopes");
const { listFacets } = require("./facetsService");

const facetsRouter = new Router();

facetsRouter.get("/", async (req, res) => {
  const facets = await listFacets();
  res.json(collectionEnvelope(facets, facets.length));
});

module.exports = facetsRouter;
