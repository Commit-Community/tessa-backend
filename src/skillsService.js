const db = require("./db");

exports.listSkills = async () => {
  const { rows: skills } = await db.query(
    "SELECT id, name, description FROM skills ORDER BY name;"
  );
  return skills;
};

exports.findSkill = async (skillId) => {
  const {
    rows: [skill],
  } = await db.query(
    "SELECT id, name, description FROM skills WHERE id = $1;",
    [skillId]
  );
  if (!skill) {
    return undefined;
  }
  const [{ rows: tags }, { rows: recommendations }] = await Promise.all([
    db.query(
      "SELECT name FROM tags JOIN skills_tags ON skills_tags.tag_id = tags.id WHERE skills_tags.skill_id = $1 ORDER BY name;",
      [skillId]
    ),
    db.query(
      "SELECT id, markdown, facet_id FROM recommendations WHERE skill_id = $1 ORDER BY facet_id, id;",
      [skillId]
    ),
  ]);
  return {
    ...skill,
    tags: tags.map(({ name }) => name),
    recommendations,
  };
};
