const authRouter = require("../authRouter");
const {
  createAppAgentForRouter,
  sessionDestroyMock,
  mockUserId,
  mockGithubUsername,
} = require("../routerTestUtils");
const { createUser, findUserByGithubId } = require("../usersService");
const { getAccessToken, getGithubUser } = require("../githubService");
const { itemEnvelope } = require("../responseEnvelopes");

jest.mock("../usersService");
jest.mock("../githubService");

describe("authRouter", () => {
  const appAgent = createAppAgentForRouter(authRouter);

  describe("GET /github/login", () => {
    it("should redirect the request to GitHub's OAuth flow with credentials from the environment", (done) => {
      process.env.GITHUB_CLIENT_ID = "TEST_GITHUB_CLIENT_ID";
      process.env.GITHUB_REDIRECT_URI = "TEST_GITHUB_REDIRECT_URI";
      appAgent
        .get("/github/login")
        .expect(
          "Location",
          "https://github.com/login/oauth/authorize?client_id=TEST_GITHUB_CLIENT_ID&redirect_uri=TEST_GITHUB_REDIRECT_URI"
        )
        .expect(302, done);
    });
  });

  describe("GET /github/oauth/callback", () => {
    it("should redirect an existing user to the client app", (done) => {
      process.env.WEBAPP_ORIGIN = "TEST_WEBAPP_ORIGIN";
      const code = "test_code";
      const accessToken = "test_access_token";
      const githubId = 100;
      const githubUsername = "test-github-username";
      getAccessToken.mockResolvedValueOnce(accessToken);
      getGithubUser.mockResolvedValueOnce({
        id: githubId,
        login: githubUsername,
      });
      findUserByGithubId.mockResolvedValueOnce({
        id: 1,
        github_id: githubId,
        github_username: githubUsername,
      });
      appAgent
        .get(`/github/oauth/callback?code=${code}`)
        .expect("Location", process.env.WEBAPP_ORIGIN)
        .expect(302, (err) => {
          expect(getAccessToken).toHaveBeenCalledWith(code);
          expect(getGithubUser).toHaveBeenCalledWith(accessToken);
          expect(findUserByGithubId).toHaveBeenCalledWith(githubId);
          done(err);
        });
    });

    it("should create a new user and redirect them to the client app", (done) => {
      process.env.WEBAPP_ORIGIN = "TEST_WEBAPP_ORIGIN";
      const code = "test_code";
      const accessToken = "test_access_token";
      const githubId = 100;
      const githubUsername = "test-github-username";
      getAccessToken.mockResolvedValueOnce(accessToken);
      getGithubUser.mockResolvedValueOnce({
        id: githubId,
        login: githubUsername,
      });
      findUserByGithubId.mockResolvedValueOnce(undefined);
      createUser.mockResolvedValueOnce({
        id: 1,
        github_id: githubId,
        github_username: githubUsername,
      });
      appAgent
        .get(`/github/oauth/callback?code=${code}`)
        .expect("Location", process.env.WEBAPP_ORIGIN)
        .expect(302, (err) => {
          expect(getAccessToken).toHaveBeenCalledWith(code);
          expect(getGithubUser).toHaveBeenCalledWith(accessToken);
          expect(findUserByGithubId).toHaveBeenCalledWith(githubId);
          expect(createUser).toHaveBeenCalledWith(githubId, githubUsername);
          done(err);
        });
    });

    it("should respond with a bad request error if code is not passed", (done) => {
      appAgent.get("/github/oauth/callback").expect(400, done);
    });

    it("should respond with ain internal server error if the request to get an access token fails", (done) => {
      getAccessToken.mockRejectedValueOnce(new Error());
      appAgent.get("/github/oauth/callback?code=test_code").expect(500, done);
    });

    it("should respond with ain internal server error if the request to get the GitHub user details fails", (done) => {
      getAccessToken.mockResolvedValueOnce("test_access_token");
      getGithubUser.mockRejectedValueOnce(new Error());
      appAgent.get("/github/oauth/callback?code=test_code").expect(500, done);
    });

    it("should respond with ain internal server error if there is an error querying for the user", (done) => {
      getAccessToken.mockResolvedValueOnce("test_access_token");
      getGithubUser.mockResolvedValueOnce({ id: 100, login: "test" });
      findUserByGithubId.mockRejectedValueOnce(new Error());
      appAgent.get("/github/oauth/callback?code=test_code").expect(500, done);
    });

    it("should respond with ain internal server error if there is an error creating the user", (done) => {
      getAccessToken.mockResolvedValueOnce("test_access_token");
      getGithubUser.mockResolvedValueOnce({ id: 100, login: "test" });
      findUserByGithubId.mockResolvedValueOnce(undefined);
      createUser.mockRejectedValueOnce(new Error());
      appAgent.get("/github/oauth/callback?code=test_code").expect(500, done);
    });
  });

  describe("GET /logout", () => {
    it("should destroy the session and redirect to the client app", (done) => {
      process.env.WEBAPP_ORIGIN = "TEST_WEBAPP_ORIGIN";
      appAgent
        .get("/logout")
        .expect("Location", process.env.WEBAPP_ORIGIN)
        .expect(302, (err) => {
          expect(sessionDestroyMock).toHaveBeenCalled();
          done(err);
        });
    });
  });

  describe("GET /session", () => {
    it("should respond with data from the user's session", (done) => {
      const userId = 1;
      mockUserId(userId);
      const githubUsername = "test-github-username";
      mockGithubUsername(githubUsername);
      appAgent
        .get("/session")
        .expect(
          200,
          itemEnvelope({ github_username: githubUsername, user_id: userId }),
          done
        );
    });
  });
});
