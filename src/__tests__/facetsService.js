const { listFacets } = require("../facetsService");
const { mockQuery } = require("../db");

jest.mock("../db");

describe("facetsService", () => {
  describe("listFacets", () => {
    it("should list the facets in the database", async () => {
      const facets = [
        {
          id: 1,
          name: "test name",
          recommendation_prompt: "test recommendation prompt",
        },
      ];
      mockQuery(
        "SELECT id, name, recommendation_prompt FROM facets ORDER BY sort_order;",
        [],
        facets
      );
      expect(await listFacets()).toEqual(facets);
    });
  });
});
