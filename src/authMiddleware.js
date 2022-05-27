const { isTeamMember } = require("./githubService");
const { UnauthorizedError } = require("./httpErrors");

exports.isAuthenticated = () => (req, res, next) => {
  if (req.session.userId) {
    next();
    return;
  }
  next(new UnauthorizedError());
};

const createTeamAuthMiddleware = (teamName) => async (req, res, next) => {
  if (!req.session.githubUsername) {
    next(new UnauthorizedError());
    return;
  }
  let isUserMemberOfTeam;
  try {
    isUserMemberOfTeam = await isTeamMember(
      req.session.accessToken,
      req.session.githubUsername,
      process.env.GITHUB_AUTHZ_ORG,
      teamName
    );
  } catch (e) {
    next(e);
    return;
  }
  if (isUserMemberOfTeam) {
    next();
    return;
  }
  next(new UnauthorizedError());
};

exports.isAdmin = () =>
  createTeamAuthMiddleware(process.env.GITHUB_ADMINS_TEAM);

exports.isAuthor = () =>
  createTeamAuthMiddleware(process.env.GITHUB_AUTHORS_TEAM);
