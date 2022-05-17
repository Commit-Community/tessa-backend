const { isAuthenticated, isCollaborator } = require("../authMiddleware");
const { isRepoCollaborator } = require("../githubService");
const { UnauthorizedError } = require("../httpErrors");

jest.mock("../githubService");

describe("authMiddleware", () => {
  describe("isAuthenticated", () => {
    it("should call next if the request session has user data", () => {
      const next = jest.fn();
      isAuthenticated(
        { session: { userId: 1, githubUsername: "test" } },
        {},
        next
      );
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with an UnauthorizedError if the request session does not have user data", () => {
      const next = jest.fn();
      isAuthenticated({ session: {} }, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe("isCollaborator", () => {
    it("should call next if the logged in user is a collaborator on the project repository", async () => {
      const next = jest.fn();
      isRepoCollaborator.mockResolvedValue(true);
      process.env.GITHUB_ACCESS_TOKEN = "TEST_GITHUB_ACCESS_TOKEN";
      await isCollaborator(
        { session: { userId: 1, githubUsername: "test" } },
        {},
        next
      );
      expect(isRepoCollaborator).toHaveBeenCalledWith(
        "TEST_GITHUB_ACCESS_TOKEN",
        "test",
        "davidvandusen/tessa"
      );
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with an UnauthorizedError if the logged in user is not a collaborator on the project repository", async () => {
      const next = jest.fn();
      isRepoCollaborator.mockResolvedValue(false);
      await isCollaborator(
        { session: { userId: 1, githubUsername: "test" } },
        {},
        next
      );
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });
});
