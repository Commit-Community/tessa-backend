const request = require("./request");

const userAgentString = "TESSA API";

exports.getAccessToken = async (code) => {
  const params = new URLSearchParams();
  params.set("client_id", process.env.GITHUB_CLIENT_ID);
  params.set("client_secret", process.env.GITHUB_CLIENT_SECRET);
  params.set("code", code);
  const response = await request.post(
    `https://github.com/login/oauth/access_token?${params.toString()}`
  );
  if (response.body.error) {
    throw new Error(response.body.error);
  }
  return response.body.access_token;
};

exports.getGithubUser = async (accessToken) => {
  const response = await request
    .get("https://api.github.com/user")
    .set("User-Agent", userAgentString)
    .set("Authorization", `token ${accessToken}`);
  return response.body;
};

exports.isTeamMember = async (
  accessToken,
  githubUsername,
  organizationName,
  teamName
) => {
  const response = await request
    .get(
      `https://api.github.com/orgs/${organizationName}/teams/${teamName}/memberships/${githubUsername}`
    )
    .set("User-Agent", userAgentString)
    .set("Authorization", `token ${accessToken}`)
    .ok(({ status }) => status);
  return response.status === 200 && response.body.state === "active";
};
