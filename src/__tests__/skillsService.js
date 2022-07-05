const {
  findSkill,
  listSkills,
  createSkill,
  tagSkill,
  untagSkill,
  updateSkill,
} = require("../skillsService");
const { mockQuery } = require("../db");

jest.mock("../db");

describe("skillsService", () => {
  describe("listSkills", () => {
    it("should list the skills in the database", async () => {
      const skills = [
        { id: 1, name: "test name", description: "test description" },
      ];
      mockQuery(
        "SELECT id, name, description FROM skills ORDER BY name;",
        [],
        skills
      );
      expect(await listSkills()).toEqual(skills);
    });
  });

  describe("findSkill", () => {
    it("should return undefined if not skill exists with the given id", async () => {
      const skillId = 1;
      mockQuery(
        "SELECT id, name, description FROM skills WHERE id = $1;",
        [skillId],
        []
      );
      expect(await findSkill(skillId)).toEqual(undefined);
    });

    it("should return a skill with nested tags and recommendations for the given id", async () => {
      const skillId = 1;
      const skill = {
        id: skillId,
        name: "test name",
        description: "test description",
      };
      mockQuery(
        "SELECT id, name, description FROM skills WHERE id = $1;",
        [skillId],
        [skill]
      );
      const recommendations = [
        { id: 2, markdown: "test markdown", facet_id: 3 },
      ];
      mockQuery(
        "SELECT id, markdown, facet_id FROM recommendations WHERE skill_id = $1 ORDER BY facet_id, id;",
        [skillId],
        recommendations
      );
      const tag = { id: 4, name: "test tag" };
      mockQuery(
        "SELECT tags.id, name FROM tags JOIN skills_tags ON skills_tags.tag_id = tags.id WHERE skills_tags.skill_id = $1 ORDER BY name;",
        [skillId],
        [{ id: 4, name: "test tag" }]
      );
      expect(await findSkill(skillId)).toEqual({
        ...skill,
        recommendations,
        tags: [tag],
      });
    });
  });

  describe("createSkill", () => {
    it("should insert a skill into the database with the given data, track the change, and return the skill", async () => {
      const id = 1;
      const name = "test name";
      const description = "test description";
      const userId = 2;
      const skill = { id, name, description };
      mockQuery(
        "INSERT INTO skills (name, description) VALUES ($1, $2) RETURNING id, name, description;",
        [name, description],
        [skill]
      );
      mockQuery(
        "INSERT INTO skill_changes (skill_id, name, description, user_id) VALUES ($1, $2, $3, $4);",
        [id, name, description, userId],
        [skill]
      );
      expect(await createSkill(name, description, userId)).toEqual(skill);
    });

    it("should return successfully but log an error if tracking the change fails", async () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      const id = 1;
      const name = "test name";
      const description = "test description";
      const userId = 2;
      const skill = { id, name, description };
      mockQuery(
        "INSERT INTO skills (name, description) VALUES ($1, $2) RETURNING id, name, description;",
        [name, description],
        [skill]
      );
      const errorMessage = "test failure";
      mockQuery(
        "INSERT INTO skill_changes (skill_id, name, description, user_id) VALUES ($1, $2, $3, $4);",
        [id, name, description, userId],
        new Error(errorMessage)
      );
      expect(await createSkill(name, description, userId)).toEqual(skill);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage)
      );
      console.log = originalConsoleLog;
    });
  });

  describe("updateSkill", () => {
    it("should update a skill in the database with the given data, track the change, and return the skill", async () => {
      const id = 1;
      const name = "test name";
      const description = "test description";
      const userId = 2;
      const skill = { id, name, description };
      mockQuery(
        "UPDATE skills SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description;",
        [name, description, id],
        [skill]
      );
      mockQuery(
        "INSERT INTO skill_changes (skill_id, name, description, user_id) VALUES ($1, $2, $3, $4);",
        [id, name, description, userId],
        [skill]
      );
      expect(await updateSkill(id, name, description, userId)).toEqual(skill);
    });

    it("should return successfully but log an error if tracking the change fails", async () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      const id = 1;
      const name = "test name";
      const description = "test description";
      const userId = 2;
      const skill = { id, name, description };
      mockQuery(
        "UPDATE skills SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description;",
        [name, description, id],
        [skill]
      );
      const errorMessage = "test failure";
      mockQuery(
        "INSERT INTO skill_changes (skill_id, name, description, user_id) VALUES ($1, $2, $3, $4);",
        [id, name, description, userId],
        new Error(errorMessage)
      );
      expect(await updateSkill(id, name, description, userId)).toEqual(skill);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage)
      );
      console.log = originalConsoleLog;
    });
  });

  describe("tagSkill", () => {
    it("should return an existing association between a tag and skill", async () => {
      const skillId = "1";
      const tagId = "2";
      const tagName = "test";
      const skillTag = {
        id: "3",
        skill_id: skillId,
        tag_id: tagId,
      };
      mockQuery(
        "SELECT id, name FROM tags WHERE name = $1 ORDER BY id LIMIT 1;",
        [tagName],
        [{ id: tagId, name: tagName }]
      );
      mockQuery(
        "SELECT id, skill_id, tag_id FROM skills_tags WHERE skill_id = $1 AND tag_id = $2;",
        [skillId, tagId],
        [skillTag]
      );
      expect(await tagSkill(skillId, tagName)).toBe(skillTag);
    });

    it("should associate an existing tag with a skill", async () => {
      const skillId = "1";
      const tagId = "2";
      const tagName = "test";
      const skillTag = {
        id: "3",
        skill_id: skillId,
        tag_id: tagId,
      };
      mockQuery(
        "SELECT id, name FROM tags WHERE name = $1 ORDER BY id LIMIT 1;",
        [tagName],
        [{ id: tagId, name: tagName }]
      );
      mockQuery(
        "SELECT id, skill_id, tag_id FROM skills_tags WHERE skill_id = $1 AND tag_id = $2;",
        [skillId, tagId],
        []
      );
      mockQuery(
        "INSERT INTO skills_tags (skill_id, tag_id) VALUES ($1, $2) RETURNING id, skill_id, tag_id;",
        [skillId, tagId],
        [skillTag]
      );
      expect(await tagSkill(skillId, tagName)).toBe(skillTag);
    });

    it("should create a new skill if none exists with the given name", async () => {
      const skillId = "1";
      const tagId = "2";
      const tagName = "test";
      const tag = { id: tagId, name: tagName };
      const skillTag = {
        id: "3",
        skill_id: skillId,
        tag_id: tagId,
      };
      mockQuery(
        "SELECT id, name FROM tags WHERE name = $1 ORDER BY id LIMIT 1;",
        [tagName],
        []
      );
      mockQuery(
        "INSERT INTO tags (name) VALUES ($1) RETURNING id, name;",
        [tagName],
        [tag]
      );
      mockQuery(
        "SELECT id, skill_id, tag_id FROM skills_tags WHERE skill_id = $1 AND tag_id = $2;",
        [skillId, tagId],
        []
      );
      mockQuery(
        "INSERT INTO skills_tags (skill_id, tag_id) VALUES ($1, $2) RETURNING id, skill_id, tag_id;",
        [skillId, tagId],
        [skillTag]
      );
      expect(await tagSkill(skillId, tagName)).toBe(skillTag);
    });
  });

  describe("untagSkill", () => {
    it("should remove an association between a skill and tag", async () => {
      const skillId = "1";
      const tagId = "2";
      mockQuery(
        "DELETE FROM skills_tags WHERE skill_id = $1 AND tag_id = $2;",
        [skillId, tagId],
        []
      );
      await untagSkill(skillId, tagId);
    });
  });
});
