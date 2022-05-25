const { createAppAgentForRouter, mockUserId } = require("../routerTestUtils");
const {
  createRecommendation,
  isRecommendationIdValid,
  updateRecommendation,
} = require("../recommendationsService");
const { itemEnvelope } = require("../responseEnvelopes");
const recommendationsRouter = require("../recommendationsRouter");

jest.mock("../recommendationsService");
jest.mock("../authMiddleware");

describe("recommendationsRouter", () => {
  const appAgent = createAppAgentForRouter(recommendationsRouter);

  describe("POST /", () => {
    it("should create a recommendation with the given data", (done) => {
      const userId = 2;
      mockUserId(userId);
      const markdown = "test markdown";
      const skillId = 3;
      const facetId = 4;
      const recommendation = {
        id: 1,
        markdown,
        skill_id: skillId,
        facet_id: facetId,
      };
      createRecommendation.mockResolvedValueOnce(recommendation);
      appAgent
        .post("/")
        .send({ markdown, skill_id: skillId, facet_id: facetId })
        .expect(201, itemEnvelope(recommendation), (err) => {
          expect(createRecommendation).toHaveBeenCalledWith(
            markdown,
            skillId,
            facetId,
            userId
          );
          done(err);
        });
    });

    it("should respond with an unprocessable entity error if markdown is not sent", (done) => {
      appAgent.post("/").send({ skill_id: 1, facet_id: 2 }).expect(422, done);
    });

    it("should respond with an unprocessable entity error if markdown is not valid", (done) => {
      appAgent
        .post("/")
        .send({ markdown: "", skill_id: 1, facet_id: 2 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if skill_id is not sent", (done) => {
      appAgent
        .post("/")
        .send({ markdown: "test markdown", facet_id: 2 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if skill_id is not valid", (done) => {
      appAgent
        .post("/")
        .send({ markdown: "test markdown", skill_id: 0, facet_id: 2 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if facet_id is not sent", (done) => {
      appAgent
        .post("/")
        .send({ markdown: "test markdown", skill_id: 1 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if facet_id is not valid", (done) => {
      appAgent
        .post("/")
        .send({ markdown: "test markdown", skill_id: 1, facet_id: 0 })
        .expect(422, done);
    });

    it("should respond with an internal server error if the recommendation couldn't be created", (done) => {
      createRecommendation.mockRejectedValueOnce(new Error());
      appAgent
        .post("/")
        .send({ markdown: "test markdown", skill_id: 1, facet_id: 2 })
        .expect(500, done);
    });
  });

  describe("PUT /:id", () => {
    it("should update the recommendation with the specified id with the given data", (done) => {
      const userId = 2;
      mockUserId(userId);
      const markdown = "test markdown";
      const recommendation = { id: 1, markdown, skill_id: 3, facet_id: 4 };
      isRecommendationIdValid.mockResolvedValueOnce(true);
      updateRecommendation.mockResolvedValueOnce(recommendation);
      appAgent
        .put(`/${recommendation.id}`)
        .send({ markdown })
        .expect(200, itemEnvelope(recommendation), (err) => {
          expect(updateRecommendation).toHaveBeenCalledWith(
            recommendation.id,
            markdown,
            userId
          );
          done(err);
        });
    });

    it("should respond with a not found error if the recommendation identified by :id doesn't exist", (done) => {
      const recommendationId = 1;
      isRecommendationIdValid.mockResolvedValueOnce(false);
      appAgent.put(`/${recommendationId}`).expect(404, (err) => {
        expect(isRecommendationIdValid).toHaveBeenCalledWith(recommendationId);
        done(err);
      });
    });

    it("should respond with a bad request error if :id is not a valid id", (done) => {
      appAgent.put("/0").expect(400, (err) => {
        expect(isRecommendationIdValid).not.toHaveBeenCalled();
        done(err);
      });
    });

    it("should respond with an unprocessable entity error if markdown is not sent", (done) => {
      isRecommendationIdValid.mockResolvedValueOnce(true);
      appAgent.put("/1").send({}).expect(422, done);
    });

    it("should respond with an unprocessable entity error if markdown is not valid", (done) => {
      isRecommendationIdValid.mockResolvedValueOnce(true);
      appAgent.put("/1").send({ markdown: "" }).expect(422, done);
    });

    it("should respond with an internal server error if the query for the recommendation fails", (done) => {
      isRecommendationIdValid.mockRejectedValueOnce(new Error());
      appAgent.put("/1").send({ markdown: "test markdown" }).expect(500, done);
    });

    it("should respond with an internal server error if the skill couldn't be updated", (done) => {
      isRecommendationIdValid.mockResolvedValueOnce(true);
      updateRecommendation.mockRejectedValueOnce(new Error());
      appAgent.put("/1").send({ markdown: "test markdown" }).expect(500, done);
    });
  });
});
