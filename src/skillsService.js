const db = require("./db");

exports.listSkills = async () => {
  const { rows: skills } = await db.query(
    "SELECT id, name, description FROM skills ORDER BY name;"
  );
  if (skills.length === 0) {
    return skills;
  }
  const { rows: skillTags } = await db.query(
    "SELECT skill_id, tag_id, tags.name FROM skills_tags JOIN tags ON tag_id = tags.id ORDER BY tags.name;"
  );
  const skillsIndex = skills.reduce((mappings, { id }, index) => {
    mappings[id] = index;
    return mappings;
  }, {});
  skills.forEach((s) => (s.tags = []));
  for (const skillTag of skillTags) {
    skills[skillsIndex[skillTag.skill_id]].tags.push({
      id: skillTag.tag_id,
      name: skillTag.name,
    });
  }
  return skills;
};

exports.listLatestChangedSkills = async () => {
  const { rows: skillChanges } = await db.query(
    "SELECT skill_id, MAX(created_at) AS latest_created_at FROM skill_changes GROUP BY skill_id ORDER BY latest_created_at DESC LIMIT 3;"
  );
  if (skillChanges.length === 0) {
    return [];
  }
  const params = skillChanges.map((_, i) => `$${i + 1}`);
  const { rows: skills } = await db.query(
    `SELECT id, name, description FROM skills WHERE id IN (${params.join(
      ", "
    )});`,
    skillChanges.map((s) => s.skill_id)
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

const findTagByName = async (tagName) => {
  const {
    rows: [tag],
  } = await db.query(
    "SELECT id, name FROM tags WHERE name = $1 ORDER BY id LIMIT 1;",
    [tagName]
  );
  return tag;
};

const createTag = async (tagName) => {
  const {
    rows: [tag],
  } = await db.query(
    "INSERT INTO tags (name) VALUES ($1) RETURNING id, name;",
    [tagName]
  );
  return tag;
};

const selectOrCreateTagByName = async (tagName) =>
  (await findTagByName(tagName)) || (await createTag(tagName));

exports.tagSkill = async (skillId, tagName) => {
  const tag = await selectOrCreateTagByName(tagName);
  const {
    rows: [existingSkillTag],
  } = await db.query(
    "SELECT id, skill_id, tag_id FROM skills_tags WHERE skill_id = $1 AND tag_id = $2;",
    [skillId, tag.id]
  );
  if (existingSkillTag) {
    return existingSkillTag;
  }
  const {
    rows: [newSkillTag],
  } = await db.query(
    "INSERT INTO skills_tags (skill_id, tag_id) VALUES ($1, $2) RETURNING id, skill_id, tag_id;",
    [skillId, tag.id]
  );
  return newSkillTag;
};

exports.untagSkill = async (skillId, tagId) => {
  await db.query(
    "DELETE FROM skills_tags WHERE skill_id = $1 AND tag_id = $2;",
    [skillId, tagId]
  );
};
