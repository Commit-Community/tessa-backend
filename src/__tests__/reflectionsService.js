const { createReflection, listReflections } = require("../reflectionsService");
const { mockQuery } = require("../db");

jest.mock("../db");

describe("reflectionsService", () => {
  describe("listReflections", () => {
    it("should list the reflections in the database for the specified user", async () => {
      const userId = 1;
      const reflections = [
        {
          id: 2,
          skill_id: 3,
          statement_id: 4,
          created_at: "2000-01-01T00:00:00.000Z",
        },
      ];
      mockQuery(
        "SELECT id, skill_id, statement_id, created_at FROM reflections WHERE user_id = $1 ORDER BY created_at DESC;",
        [userId],
        reflections
      );
      expect(await listReflections(userId)).toEqual(reflections);
    });
  });

  describe("createReflection", () => {
    it("should insert a reflection into the database and return it", async () => {
      const userId = 1;
      const skillId = 2;
      const statementId = 3;
      const reflection = {
        id: 4,
        skill_id: skillId,
        statement_id: statementId,
        created_at: "2000-01-01T00:00:00.000Z",
      };
      mockQuery(
        "INSERT INTO reflections (user_id, skill_id, statement_id) VALUES ($1, $2, $3) RETURNING id, skill_id, statement_id, created_at;",
        [userId, skillId, statementId],
        [reflection]
      );
      expect(await createReflection(userId, skillId, statementId)).toEqual(
        reflection
      );
    });
  });
});
