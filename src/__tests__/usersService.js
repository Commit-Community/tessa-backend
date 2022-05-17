const { createUser, findUserByGithubId } = require("../usersService");
const { mockQuery } = require("../db");

jest.mock("../db");

describe("usersService", () => {
  describe("createUser", () => {
    it("should insert a new user into the database and return it", async () => {
      const githubId = 100;
      const githubUsername = "test";
      const user = {
        id: 1,
        github_id: githubId,
        github_username: githubUsername,
      };
      mockQuery(
        "INSERT INTO users (github_id, github_username) VALUES ($1, $2) RETURNING id, github_id, github_username;",
        [githubId, githubUsername],
        [user]
      );
      expect(await createUser(githubId, githubUsername)).toEqual(user);
    });
  });

  describe("findUserByGithubId", () => {
    it("should return a user with the given GitHub id", async () => {
      const githubId = 100;
      const user = { id: 1, github_id: githubId, github_username: "test" };
      mockQuery(
        "SELECT id, github_id, github_username FROM users WHERE github_id = $1;",
        [githubId],
        [user]
      );
      expect(await findUserByGithubId(githubId)).toEqual(user);
    });

    it("should return undefined if there is no user with the given GitHub id", async () => {
      const githubId = 100;
      mockQuery(
        "SELECT id, github_id, github_username FROM users WHERE github_id = $1;",
        [githubId],
        []
      );
      expect(await findUserByGithubId(githubId)).toEqual(undefined);
    });
  });
});
