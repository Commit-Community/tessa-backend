const db = require("./db");

exports.listReflections = async (userId) => {
  const { rows: reflections } = await db.query(
    "SELECT id, skill_id, statement_id, created_at FROM reflections WHERE user_id = $1 ORDER BY created_at DESC;",
    [userId]
  );
  return reflections;
};

exports.createReflection = async (userId, skillId, statementId) => {
  const {
    rows: [reflection],
  } = await db.query(
    "INSERT INTO reflections (user_id, skill_id, statement_id) VALUES ($1, $2, $3) RETURNING id, skill_id, statement_id, created_at;",
    [userId, skillId, statementId]
  );
  return reflection;
};
