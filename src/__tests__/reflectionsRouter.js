const { collectionEnvelope, itemEnvelope } = require("../responseEnvelopes");
const { createAppAgentForRouter } = require("../routerTestUtils");
const { listReflections } = require("../reflectionsService");
const reflectionsRouter = require("../reflectionsRouter");
const { mockUserId } = require("../routerTestUtils");
const { createReflection } = require("../reflectionsService");

jest.mock("../reflectionsService");

describe("reflectionsRouter", () => {
  const appAgent = createAppAgentForRouter(reflectionsRouter);

  describe("GET /", () => {
    it("should respond with a collection of all the reflections for the current user", (done) => {
      const userId = 1;
      mockUserId(userId);
      const reflections = [
        {
          id: 2,
          skill_id: 3,
          statement_id: 4,
          created_at: "2000-01-01T00:00:00.000Z",
        },
      ];
      listReflections.mockResolvedValueOnce(reflections);
      appAgent
        .get("/")
        .expect(200, collectionEnvelope(reflections, 1), (err) => {
          expect(listReflections).toHaveBeenCalledWith(userId);
          done(err);
        });
    });

    it("should respond with an internal server error if there is an error querying for the reflections", (done) => {
      listReflections.mockRejectedValueOnce(new Error());
      appAgent.get("/").expect(500, done);
    });
  });

  describe("POST /", () => {
    it("should create a reflection with the given data for the current user", (done) => {
      const userId = 1;
      mockUserId(userId);
      const statementId = 2;
      const skillId = 3;
      const reflection = {
        id: 4,
        skill_id: skillId,
        statement_id: statementId,
        created_at: "2000-01-01T00:00:00.000Z",
      };
      createReflection.mockResolvedValueOnce(reflection);
      appAgent
        .post("/")
        .send({ statement_id: statementId, skill_id: skillId })
        .expect(201, itemEnvelope(reflection), (err) => {
          expect(createReflection).toHaveBeenCalledWith(
            userId,
            skillId,
            statementId
          );
          done(err);
        });
    });

    it("should respond with an unprocessable entity error if statement_id is not sent", (done) => {
      mockUserId(1);
      appAgent.post("/").send({ skill_id: 2 }).expect(422, done);
    });

    it("should respond with an unprocessable entity error if skill_id is not sent", (done) => {
      mockUserId(1);
      appAgent.post("/").send({ statement_id: 2 }).expect(422, done);
    });

    it("should respond with an unprocessable entity error if statement_id is not a valid id", (done) => {
      mockUserId(1);
      appAgent
        .post("/")
        .send({ statement_id: 0, skill_id: 2 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if skill_id is not a valid id", (done) => {
      mockUserId(1);
      appAgent
        .post("/")
        .send({ statement_id: 2, skill_id: 0 })
        .expect(422, done);
    });

    it("should respond with an internal server error if there is an error creating the reflection", (done) => {
      mockUserId(1);
      createReflection.mockRejectedValueOnce(new Error());
      appAgent
        .post("/")
        .send({ statement_id: 2, skill_id: 3 })
        .expect(500, done);
    });
  });
});
