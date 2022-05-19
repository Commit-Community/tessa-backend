const { listFacets, createFacet } = require("../facetsService");
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
          sort_order: 0,
        },
      ];
      mockQuery(
        "SELECT id, name, recommendation_prompt, sort_order FROM facets ORDER BY sort_order;",
        [],
        facets
      );
      expect(await listFacets()).toEqual(facets);
    });
  });

  describe("createFacet", () => {
    it("should insert a facet into the database and return it", async () => {
      const name = "test name";
      const recommendationPrompt = "test recommendation prompt";
      const sortOrder = 0;
      const facet = {
        id: 1,
        name,
        recommendation_prompt: recommendationPrompt,
        sort_order: sortOrder,
      };
      mockQuery(
        "INSERT INTO facets (name, recommendation_prompt, sort_order) VALUES ($1, $2, $3) RETURNING id, name, recommendation_prompt, sort_order;",
        [name, recommendationPrompt, sortOrder],
        [facet]
      );
      expect(await createFacet(name, recommendationPrompt, sortOrder)).toEqual(
        facet
      );
    });
  });
});
