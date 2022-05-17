const { collectionEnvelope } = require("../responseEnvelopes");
const { createAppAgentForRouter } = require("../routerTestUtils");
const facetsRouter = require("../facetsRouter");
const { listFacets } = require("../facetsService");

jest.mock("../facetsService");

describe("facetsRouter", () => {
  const appAgent = createAppAgentForRouter(facetsRouter);

  describe("GET /", () => {
    it("should respond with a collection of all the facets", (done) => {
      const facets = [
        {
          id: 1,
          name: "test name",
          recommendation_prompt: "test recommendation prompt",
        },
      ];
      listFacets.mockResolvedValueOnce(facets);
      appAgent.get("/").expect(200, collectionEnvelope(facets, 1), (err) => {
        expect(listFacets).toHaveBeenCalled();
        done(err);
      });
    });
  });
});
