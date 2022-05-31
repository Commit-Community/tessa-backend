const db = require("./db");

exports.listStatements = async () => {
  const { rows: statements } = await db.query(
    "SELECT id, assertion, facet_id, sort_order FROM statements ORDER BY facet_id, sort_order;"
  );
  return statements;
};

exports.createStatement = async (assertion, facetId, sortOrder) => {
  const {
    rows: [statement],
  } = await db.query(
    "INSERT INTO statements (assertion, facet_id, sort_order) VALUES ($1, $2, $3) RETURNING id, assertion, facet_id, sort_order;",
    [assertion, facetId, sortOrder]
  );
  return statement;
};

exports.updateStatement = async (statementId, assertion) => {
  const {
    rows: [statement],
  } = await db.query(
    "UPDATE statements SET assertion = $1 WHERE id = $2 RETURNING id, assertion, facet_id, sort_order;",
    [assertion, statementId]
  );
  return statement;
};
