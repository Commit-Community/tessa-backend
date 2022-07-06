const { Router } = require("express");

const { itemEnvelope } = require("./responseEnvelopes");
const {
  listLatestChangedRecommendations,
} = require("./recommendationsService");
const { listLatestChangedSkills } = require("./skillsService");

const feedsRouter = new Router();

feedsRouter.get("/changes", async (req, res, next) => {
  let recommendations, skills;
  try {
    [recommendations, skills] = await Promise.all([
      listLatestChangedRecommendations(),
      listLatestChangedSkills(),
    ]);
  } catch (e) {
    next(e);
    return;
  }
  res.json(itemEnvelope({ recommendations, skills }));
});

module.exports = feedsRouter;
