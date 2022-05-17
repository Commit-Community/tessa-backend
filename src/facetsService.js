const db = require("./db");

exports.listFacets = async () => {
  const { rows: facets } = await db.query(
    "SELECT id, name, recommendation_prompt FROM facets ORDER BY sort_order;"
  );
  return facets;
};
