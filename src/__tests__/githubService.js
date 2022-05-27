const request = require("../request");
const {
  getAccessToken,
  getGithubUser,
  isTeamMember,
} = require("../githubService");

jest.mock("../request");
const mockRequestPost = jest.mocked(request.post);
const mockRequestGet = jest.mocked(request.get);

describe("githubService", () => {
  describe("getAccessToken", () => {
    it("should fetch a github access token using the provided code", async () => {
      process.env.GITHUB_CLIENT_SECRET = "TEST_GITHUB_CLIENT_SECRET";
      process.env.GITHUB_CLIENT_ID = "TEST_GITHUB_CLIENT_ID";
      const accessToken = "test_access_token";
      const code = "test_code";
      mockRequestPost.mockResolvedValue({
        body: { access_token: accessToken },
      });
      expect(await getAccessToken(code)).toEqual(accessToken);
      expect(mockRequestPost).toHaveBeenCalledWith(
        `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${code}`
      );
    });

    it("should throw an error if the response from github was an error", async () => {
      mockRequestPost.mockResolvedValue({
        body: { error: "bad_verification_code" },
      });
      await expect(getAccessToken("bad_code")).rejects.toThrow();
    });
  });

  describe("getGithubUser", () => {
    it("should get details about the current user from the github api", async () => {
      const accessToken = "test_access_token";
      const githubUser = { id: 100 };
      const mockSet = jest.fn();
      const mockRequest = { set: mockSet };
      mockRequestGet.mockReturnValue(mockRequest);
      mockSet.mockReturnValueOnce(mockRequest);
      mockSet.mockReturnValueOnce({ body: githubUser });
      expect(await getGithubUser(accessToken)).toEqual(githubUser);
      expect(mockRequestGet).toHaveBeenCalledWith(
        "https://api.github.com/user"
      );
      expect(mockSet).toHaveBeenCalledWith("User-Agent", "TESSA API");
      expect(mockSet).toHaveBeenCalledWith(
        "Authorization",
        `token ${accessToken}`
      );
    });
  });

  describe("isTeamMember", () => {
    it("should resolve to true if the specified user is a member of the specified team", async () => {
      const accessToken = "test_access_token";
      const githubUsername = "test-github-username";
      const organizationName = "test-organization";
      const teamName = "test-team";
      const response = { status: 200, body: { state: "active" } };
      const mockSet = jest.fn();
      const mockOk = jest.fn((callback) => {
        expect(callback(response)).toBeTruthy();
        return response;
      });
      const mockRequest = { set: mockSet };
      mockRequestGet.mockReturnValue(mockRequest);
      mockSet.mockReturnValueOnce(mockRequest);
      mockSet.mockReturnValueOnce({ ok: mockOk });
      expect(
        await isTeamMember(
          accessToken,
          githubUsername,
          organizationName,
          teamName
        )
      ).toEqual(true);
      expect(mockRequestGet).toHaveBeenCalledWith(
        `https://api.github.com/orgs/${organizationName}/teams/${teamName}/memberships/${githubUsername}`
      );
      expect(mockSet).toHaveBeenCalledWith("User-Agent", "TESSA API");
      expect(mockSet).toHaveBeenCalledWith(
        "Authorization",
        `token ${accessToken}`
      );
    });

    it("should resolve to false if the specified user is not a member of the specified team", async () => {
      const mockSet = jest.fn();
      const mockRequest = { set: mockSet };
      mockRequestGet.mockReturnValue(mockRequest);
      mockSet.mockReturnValueOnce(mockRequest);
      mockSet.mockReturnValueOnce({
        ok: jest.fn(() => ({ status: 404, body: {} })),
      });
      expect(
        await isTeamMember(
          "test_access_token",
          "test-github-username",
          "test-organization",
          "test-team"
        )
      ).toEqual(false);
    });

    it("should resolve to false if the specified user's membership on the specified team is pending", async () => {
      const mockSet = jest.fn();
      const mockRequest = { set: mockSet };
      mockRequestGet.mockReturnValue(mockRequest);
      mockSet.mockReturnValueOnce(mockRequest);
      mockSet.mockReturnValueOnce({
        ok: jest.fn(() => ({ status: 200, body: { state: "pending" } })),
      });
      expect(
        await isTeamMember(
          "test_access_token",
          "test-github-username",
          "test-organization",
          "test-team"
        )
      ).toEqual(false);
    });
  });
});
