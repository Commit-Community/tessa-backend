const { isAuthenticated, isAuthor, isAdmin } = require("../authMiddleware");
const { isTeamMember } = require("../githubService");
const { UnauthorizedError } = require("../httpErrors");

jest.mock("../githubService");

describe("authMiddleware", () => {
  describe("isAuthenticated", () => {
    it("should call next if the request session has user data", () => {
      const next = jest.fn();
      isAuthenticated()(
        {
          session: {
            accessToken: "test_access_token",
            githubUsername: "test",
            userId: "1",
          },
        },
        {},
        next
      );
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with an UnauthorizedError if the request session does not have user data", () => {
      const next = jest.fn();
      isAuthenticated()({ session: {} }, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  [
    {
      fnName: "isAdmin",
      fnImpl: isAdmin,
      teamNameEnvVar: "GITHUB_ADMINS_TEAM",
    },
    {
      fnName: "isAuthor",
      fnImpl: isAuthor,
      teamNameEnvVar: "GITHUB_AUTHORS_TEAM",
    },
  ].forEach(({ fnName, fnImpl, teamNameEnvVar }) => {
    describe(fnName, () => {
      it("should call next if the current user is a member of the configured team in the configured organization", async () => {
        process.env.GITHUB_AUTHZ_ORG = "TEST_GITHUB_AUTHZ_ORG";
        process.env[teamNameEnvVar] = `TEST_${teamNameEnvVar}`;
        const next = jest.fn();
        const accessToken = "test_access_token";
        const githubUsername = "test";
        isTeamMember.mockResolvedValueOnce(true);
        await fnImpl()(
          { session: { accessToken, githubUsername, userId: "1" } },
          {},
          next
        );
        expect(isTeamMember).toHaveBeenCalledWith(
          accessToken,
          githubUsername,
          process.env.GITHUB_AUTHZ_ORG,
          process.env[teamNameEnvVar]
        );
        expect(next).toHaveBeenCalledWith();
      });

      it("should call next with an UnauthorizedError if the user if the user is not logged in", async () => {
        const next = jest.fn();
        await fnImpl()({ session: {} }, {}, next);
        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      });

      it("should call next with an UnauthorizedError if the user is not a member of the team", async () => {
        const next = jest.fn();
        isTeamMember.mockResolvedValueOnce(false);
        await fnImpl()(
          {
            session: {
              accessToken: "test_access_token",
              githubUsername: "test",
              userId: "1",
            },
          },
          {},
          next
        );
        expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      });

      it("should call next with an error if the request to authorize the user fails", async () => {
        const next = jest.fn();
        isTeamMember.mockRejectedValueOnce(new Error());
        await fnImpl()(
          {
            session: {
              accessToken: "test_access_token",
              githubUsername: "test",
              userId: "1",
            },
          },
          {},
          next
        );
        expect(next).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });
});
