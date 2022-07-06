const { createAppAgentForRouter } = require("../routerTestUtils");
const feedsRouter = require("../feedsRouter");
const { itemEnvelope } = require("../responseEnvelopes");
const {
  listLatestChangedRecommendations,
} = require("../recommendationsService");
const { listLatestChangedSkills } = require("../skillsService");

jest.mock("../recommendationsService");
jest.mock("../skillsService");

describe("feedsRouter", () => {
  const appAgent = createAppAgentForRouter(feedsRouter);

  describe("GET /changes", () => {
    it("should respond with lists of recent skills and recommendations", (done) => {
      listLatestChangedRecommendations.mockResolvedValueOnce([]);
      listLatestChangedSkills.mockResolvedValueOnce([]);
      appAgent
        .get("/changes")
        .expect(
          200,
          itemEnvelope({ recommendations: [], skills: [] }),
          (err) => {
            expect(listLatestChangedRecommendations).toHaveBeenCalledWith();
            expect(listLatestChangedSkills).toHaveBeenCalledWith();
            done(err);
          }
        );
    });

    it("should respond with an internal server error if there is a problem listing recommendations", (done) => {
      listLatestChangedRecommendations.mockRejectedValueOnce(new Error());
      listLatestChangedSkills.mockResolvedValueOnce([]);
      appAgent.get("/changes").expect(500, done);
    });

    it("should respond with an internal server error if there is a problem listing skills", (done) => {
      listLatestChangedRecommendations.mockResolvedValueOnce([]);
      listLatestChangedSkills.mockRejectedValueOnce(new Error());
      appAgent.get("/changes").expect(500, done);
    });
  });
});
