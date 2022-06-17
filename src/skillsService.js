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
      "SELECT tags.id, name FROM tags JOIN skills_tags ON skills_tags.tag_id = tags.id WHERE skills_tags.skill_id = $1 ORDER BY name;",
      [skillId]
    ),
    db.query(
      "SELECT id, markdown, facet_id FROM recommendations WHERE skill_id = $1 ORDER BY facet_id, id;",
      [skillId]
    ),
  ]);
  return {
    ...skill,
    tags,
    recommendations,
  };
};

const trackSkillChange = async (skillId, name, description, userId) => {
  try {
    await db.query(
      "INSERT INTO skill_changes (skill_id, name, description, user_id) VALUES ($1, $2, $3, $4);",
      [skillId, name, description, userId]
    );
  } catch (e) {
    console.log(
      `Failed to track a skill change with data skillId="${skillId}", name="${name}", description="${description}", userId="${userId}"}\n${e}`
    );
  }
};

exports.createSkill = async (name, description, userId) => {
  const {
    rows: [skill],
  } = await db.query(
    "INSERT INTO skills (name, description) VALUES ($1, $2) RETURNING id, name, description;",
    [name, description]
  );
  await trackSkillChange(skill.id, name, description, userId);
  return skill;
};

exports.updateSkill = async (skillId, name, description, userId) => {
  const {
    rows: [skill],
  } = await db.query(
    "UPDATE skills SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description;",
    [name, description, skillId]
  );
  await trackSkillChange(skillId, name, description, userId);
  return skill;
};
