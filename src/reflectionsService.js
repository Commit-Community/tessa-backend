const db = require("./db");

exports.listReflections = async (userId) => {
  const { rows: reflections } = await db.query(
    "SELECT id, skill_id, statement_id, created_at FROM reflections WHERE user_id = $1 ORDER BY created_at DESC;",
    [userId]
  );
  return reflections;
};

exports.findLatestReflectionForSkillFacet = async (
  userId,
  skillId,
  facetId
) => {
  const {
    rows: [reflection],
  } = await db.query(
    "SELECT r.id, r.skill_id, r.statement_id, r.created_at FROM reflections r JOIN statements s ON r.statement_id = s.id WHERE r.user_id = $1 AND r.skill_id = $2 AND s.facet_id = $3 ORDER BY r.created_at DESC LIMIT 1;",
    [userId, skillId, facetId]
  );
  return reflection || null;
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
