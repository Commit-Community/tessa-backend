const { collectionEnvelope } = require("../responseEnvelopes");
const { createAppAgentForRouter } = require("../routerTestUtils");
const { listStatements } = require("../statementsService");
const statementsRouter = require("../statementsRouter");

jest.mock("../statementsService");

describe("statementsRouter", () => {
  const appAgent = createAppAgentForRouter(statementsRouter);

  describe("GET /", () => {
    it("should respond with a collection of all the statements", (done) => {
      const statements = [
        {
          id: 1,
          statement: "test statement",
          facet_id: 2,
        },
      ];
      listStatements.mockResolvedValueOnce(statements);
      appAgent
        .get("/")
        .expect(200, collectionEnvelope(statements, 1), (err) => {
          expect(listStatements).toHaveBeenCalled();
          done(err);
        });
    });

    it("should respond with an internal server error if there is an error querying for the statements", (done) => {
      listStatements.mockRejectedValueOnce(new Error());
      appAgent.get("/").expect(500, done);
    });
  });
});
