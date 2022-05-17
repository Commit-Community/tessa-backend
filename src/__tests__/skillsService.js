const { findSkill, listSkills } = require("../skillsService");
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
      const tag = "test tag";
      mockQuery(
        "SELECT name FROM tags JOIN skills_tags ON skills_tags.tag_id = tags.id WHERE skills_tags.skill_id = $1 ORDER BY name;",
        [skillId],
        [{ name: tag }]
      );
      expect(await findSkill(skillId)).toEqual({
        ...skill,
        recommendations,
        tags: [tag],
      });
    });
  });
});
