const { listStatements } = require("../statementsService");
const { mockQuery } = require("../db");

jest.mock("../db");

describe("statementsService", () => {
  describe("listStatements", () => {
    it("should list the statements in the database", async () => {
      const statements = [{ id: 1, assertion: "test assertion", facet_id: 2 }];
      mockQuery(
        "SELECT id, assertion, facet_id FROM statements ORDER BY facet_id, sort_order;",
        [],
        statements
      );
      expect(await listStatements()).toEqual(statements);
    });
  });
});
