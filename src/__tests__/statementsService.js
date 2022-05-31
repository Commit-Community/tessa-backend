const {
  listStatements,
  createStatement,
  updateStatement,
} = require("../statementsService");
const { mockQuery } = require("../db");

jest.mock("../db");

describe("statementsService", () => {
  describe("listStatements", () => {
    it("should list the statements in the database", async () => {
      const statements = [
        { id: 1, assertion: "test assertion", facet_id: 2, sort_order: 0 },
      ];
      mockQuery(
        "SELECT id, assertion, facet_id, sort_order FROM statements ORDER BY facet_id, sort_order;",
        [],
        statements
      );
      expect(await listStatements()).toEqual(statements);
    });
  });

  describe("createStatement", () => {
    it("should insert a statement into the database and return it", async () => {
      const assertion = "test assertion";
      const facetId = 2;
      const sortOrder = 0;
      const statement = {
        id: 1,
        assertion,
        facet_id: facetId,
        sort_order: sortOrder,
      };
      mockQuery(
        "INSERT INTO statements (assertion, facet_id, sort_order) VALUES ($1, $2, $3) RETURNING id, assertion, facet_id, sort_order;",
        [assertion, facetId, sortOrder],
        [statement]
      );
      expect(await createStatement(assertion, facetId, sortOrder)).toEqual(
        statement
      );
    });
  });

  describe("updateStatement", () => {
    it("should update the assertion of the specified statement and return it", async () => {
      const assertion = "test assertion";
      const statementId = 1;
      const statement = {
        id: statementId,
        assertion,
        facet_id: 2,
        sort_order: 0,
      };
      mockQuery(
        "UPDATE statements SET assertion = $1 WHERE id = $2 RETURNING id, assertion, facet_id, sort_order;",
        [assertion, statementId],
        [statement]
      );
      expect(await updateStatement(statementId, assertion)).toEqual(statement);
    });
  });
});
