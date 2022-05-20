const { collectionEnvelope, itemEnvelope } = require("../responseEnvelopes");
const { createAppAgentForRouter } = require("../routerTestUtils");
const { listStatements, createStatement } = require("../statementsService");
const statementsRouter = require("../statementsRouter");

jest.mock("../authMiddleware");
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

  describe("POST /", () => {
    it("should create a statement with the given data", (done) => {
      const assertion = "test assertion";
      const facetId = 2;
      const sortOrder = 0;
      const statement = {
        id: 1,
        assertion,
        facet_id: facetId,
        sort_order: sortOrder,
      };
      createStatement.mockResolvedValueOnce(statement);
      appAgent
        .post("/")
        .send({
          assertion,
          facet_id: facetId,
          sort_order: sortOrder,
        })
        .expect(201, itemEnvelope(statement), (err) => {
          expect(createStatement).toHaveBeenCalledWith(
            assertion,
            facetId,
            sortOrder
          );
          done(err);
        });
    });

    it("should respond with an unprocessable entity error if assertion is not sent", (done) => {
      appAgent.post("/").send({ facet_id: 2, sort_order: 0 }).expect(422, done);
    });

    it("should respond with an unprocessable entity error if assertion is not valid", (done) => {
      appAgent
        .post("/")
        .send({ assertion: "", facet_id: 2, sort_order: 0 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if facet_id is not sent", (done) => {
      appAgent
        .post("/")
        .send({ assertion: "test assertion", sort_order: 0 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if facet_id is not valid", (done) => {
      appAgent
        .post("/")
        .send({ assertion: "test assertion", facet_id: 0, sort_order: 0 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if sort_order is not sent", (done) => {
      appAgent
        .post("/")
        .send({ assertion: "test assertion", facet_id: 2 })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if sort_order is not sent", (done) => {
      appAgent
        .post("/")
        .send({
          assertion: "test assertion",
          facet_id: 2,
          sort_order: "bad value",
        })
        .expect(422, done);
    });

    it("should respond with an internal server error if there is an error creating the statement", (done) => {
      createStatement.mockRejectedValueOnce(new Error());
      appAgent
        .post("/")
        .send({ assertion: "test assertion", facet_id: 2, sort_order: 0 })
        .expect(500, done);
    });
  });
});
