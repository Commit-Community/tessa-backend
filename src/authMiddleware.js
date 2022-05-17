const { isRepoCollaborator } = require("./githubService");
const { UnauthorizedError } = require("./httpErrors");

exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
    return;
  }
  next(new UnauthorizedError());
};

exports.isCollaborator = async (req, res, next) => {
  const hasCollaboratorAccess = await isRepoCollaborator(
    process.env.GITHUB_ACCESS_TOKEN,
    req.session.githubUsername,
    "davidvandusen/tessa"
  );
  if (hasCollaboratorAccess) {
    next();
    return;
  }
  next(new UnauthorizedError());
};
