const db = require("./db");

exports.listFacets = async () => {
  const { rows: facets } = await db.query(
    "SELECT id, name, recommendation_prompt, sort_order FROM facets ORDER BY sort_order;"
  );
  return facets;
};

exports.createFacet = async (name, recommendationPrompt, sortOrder) => {
  const {
    rows: [facet],
  } = await db.query(
    "INSERT INTO facets (name, recommendation_prompt, sort_order) VALUES ($1, $2, $3) RETURNING id, name, recommendation_prompt, sort_order;",
    [name, recommendationPrompt, sortOrder]
  );
  return facet;
};
