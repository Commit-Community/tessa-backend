const db = require("./db");

exports.listStatements = async () => {
  const { rows: statements } = await db.query(
    "SELECT id, assertion, facet_id FROM statements ORDER BY facet_id, sort_order;"
  );
  return statements;
};
