const db = require("./db");

exports.listLatestChangedRecommendations = async () => {
  const { rows: recommendationChanges } = await db.query(
    "SELECT recommendation_id, MAX(created_at) AS latest_created_at FROM recommendation_changes GROUP BY recommendation_id ORDER BY latest_created_at DESC LIMIT 6;"
  );
  if (recommendationChanges.length === 0) {
    return [];
  }
  const params = recommendationChanges.map((_, i) => `$${i + 1}`);
  const { rows: recommendationRows } = await db.query(
    `
      SELECT
        recommendations.id AS id,
        markdown,
        skills.id AS skill_id,
        skills.name AS skill_name,
        skills.description AS skill_description,
        facets.id as facet_id,
        facets.name AS facet_name,
        facets.recommendation_prompt AS facet_recommendation_prompt
      FROM
        recommendations
        JOIN skills ON recommendations.skill_id = skills.id
        JOIN facets ON recommendations.facet_id = facets.id
      WHERE
        recommendations.id IN (${params.join(", ")});
    `,
    recommendationChanges.map((r) => r.recommendation_id)
  );
  return recommendationRows.map((row) => ({
    id: row.id,
    markdown: row.markdown,
    skill: {
      id: row.skill_id,
      name: row.skill_name,
      description: row.skill_description,
    },
    facet: {
      id: row.facet_id,
      name: row.facet_name,
      recommendation_prompt: row.facet_recommendation_prompt,
    },
  }));
};

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
