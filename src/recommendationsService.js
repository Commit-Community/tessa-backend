const db = require("./db");

exports.isRecommendationIdValid = async (recommendationId) => {
  const {
    rows: [recommendation],
  } = await db.query("SELECT id FROM recommendations WHERE id = $1;", [
    recommendationId,
  ]);
  return !!recommendation;
};

const trackRecommendationChange = async (
  markdown,
  recommendationId,
  userId
) => {
  try {
    await db.query(
      "INSERT INTO recommendation_changes (markdown, recommendation_id, user_id) VALUES ($1, $2, $3);",
      [markdown, recommendationId, userId]
    );
  } catch (e) {
    console.log(
      `Failed to track a recommendation change with data markdown="${markdown}", recommendationId="${recommendationId}", userId="${userId}"}\n${e}`
    );
  }
};

exports.createRecommendation = async (markdown, skillId, facetId, userId) => {
  const {
    rows: [recommendation],
  } = await db.query(
    "INSERT INTO recommendations (markdown, skill_id, facet_id) VALUES ($1, $2, $3) RETURNING id, markdown, skill_id, facet_id;",
    [markdown, skillId, facetId]
  );
  await trackRecommendationChange(markdown, recommendation.id, userId);
  return recommendation;
};

exports.updateRecommendation = async (recommendationId, markdown, userId) => {
  const {
    rows: [recommendation],
  } = await db.query(
    "UPDATE recommendations SET markdown = $1 WHERE id = $2 RETURNING id, markdown, skill_id, facet_id;",
    [markdown, recommendationId]
  );
  await trackRecommendationChange(markdown, recommendationId, userId);
  return recommendation;
};
