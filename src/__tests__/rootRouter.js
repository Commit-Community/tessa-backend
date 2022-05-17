const { createAppAgentForRouter } = require("../routerTestUtils");
const rootRouter = require("../rootRouter");

describe("rootRouter", () => {
  const appAgent = createAppAgentForRouter(rootRouter);

  describe("GET /", () => {
    it("should respond with an empty object", done => {
      appAgent.get("/").expect(200, {}, done);
    });
  });
});
