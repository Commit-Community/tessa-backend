const request = require("../request");
const {
  getAccessToken,
  getGithubUser,
  isOrgMember,
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
      const mockSet = jest.fn();
      const mockRequest = { set: mockSet };
      mockRequestGet.mockReturnValue(mockRequest);
      mockSet.mockReturnValueOnce(mockRequest);
      mockSet.mockReturnValueOnce({ body: { id: 100 } });
      expect(await getGithubUser(accessToken)).toEqual({ id: 100 });
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

  describe("isOrgMember", () => {
    it("should return whether the user is a member of the organization", async () => {
      const accessToken = "test_access_token";
      const mockSet = jest.fn();
      const mockOk = jest.fn((callback) => {
        const response = { status: 204 };
        expect(callback(response)).toBeTruthy();
        return response;
      });
      const mockRequest = { set: mockSet };
      mockRequestGet.mockReturnValue(mockRequest);
      mockSet.mockReturnValueOnce(mockRequest);
      mockSet.mockReturnValueOnce({ ok: mockOk });
      const organizationName = "test-organization";
      const githubUsername = "test-github-username";
      expect(
        await isOrgMember(accessToken, githubUsername, organizationName)
      ).toEqual(true);
      expect(mockRequestGet).toHaveBeenCalledWith(
        `https://api.github.com/orgs/${organizationName}/members/${githubUsername}`
      );
      expect(mockSet).toHaveBeenCalledWith("User-Agent", "TESSA API");
      expect(mockSet).toHaveBeenCalledWith(
        "Authorization",
        `token ${accessToken}`
      );
    });
  });
});
