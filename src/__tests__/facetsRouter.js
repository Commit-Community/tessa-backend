const { collectionEnvelope, itemEnvelope } = require("../responseEnvelopes");
const { createAppAgentForRouter } = require("../routerTestUtils");
const facetsRouter = require("../facetsRouter");
const { listFacets, createFacet } = require("../facetsService");

jest.mock("../facetsService");
jest.mock("../authMiddleware");

describe("facetsRouter", () => {
  const appAgent = createAppAgentForRouter(facetsRouter);

  describe("GET /", () => {
    it("should respond with a collection of all the facets", (done) => {
      const facets = [
        {
          id: 1,
          name: "test name",
          recommendation_prompt: "test recommendation prompt",
          sort_order: 0,
        },
      ];
      listFacets.mockResolvedValueOnce(facets);
      appAgent.get("/").expect(200, collectionEnvelope(facets, 1), (err) => {
        expect(listFacets).toHaveBeenCalled();
        done(err);
      });
    });

    it("should respond with an internal server error if there is an error querying for the facets", (done) => {
      listFacets.mockRejectedValueOnce(new Error());
      appAgent.get("/").expect(500, done);
    });
  });

  describe("POST /", () => {
    it("should create a facet with the given data", (done) => {
      const name = "test name";
      const recommendationPrompt = "test recommendation prompt";
      const sortOrder = 0;
      const facet = {
        id: 1,
        name,
        recommendation_prompt: recommendationPrompt,
        sort_order: sortOrder,
      };
      createFacet.mockResolvedValueOnce(facet);
      appAgent
        .post("/")
        .send({
          name: name,
          recommendation_prompt: recommendationPrompt,
          sort_order: sortOrder,
        })
        .expect(201, itemEnvelope(facet), (err) => {
          expect(createFacet).toHaveBeenCalledWith(
            name,
            recommendationPrompt,
            sortOrder
          );
          done(err);
        });
    });

    it("should respond with an unprocessable entity error if name is not sent", (done) => {
      appAgent
        .post("/")
        .send({
          recommendation_prompt: "test recommendation prompt",
          sort_order: 0,
        })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if name is not valid", (done) => {
      appAgent
        .post("/")
        .send({
          name: "",
          recommendation_prompt: "test recommendation prompt",
          sort_order: 0,
        })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if recommendation_prompt is not sent", (done) => {
      appAgent
        .post("/")
        .send({ name: "test name", sort_order: 0 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if recommendation_prompt is not valid", (done) => {
      appAgent
        .post("/")
        .send({ name: "test name", recommendation_prompt: "", sort_order: 0 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if sort_order is not sent", (done) => {
      appAgent
        .post("/")
        .send({
          name: "test name",
          recommendation_prompt: "test recommendation prompt",
        })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if sort_order is not valid", (done) => {
      appAgent
        .post("/")
        .send({
          name: "test name",
          recommendation_prompt: "test recommendation prompt",
          sort_order: "bad value",
        })
        .expect(422, done);
    });

    it("should respond with an internal server error if the facet couldn't be created", (done) => {
      createFacet.mockRejectedValueOnce(new Error());
      appAgent
        .post("/")
        .send({
          name: "test name",
          recommendation_prompt: "test recommendation prompt",
          sort_order: 0,
        })
        .expect(500, done);
    });
  });
});
