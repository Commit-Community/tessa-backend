const { isOrgMember } = require("./githubService");
const { UnauthorizedError } = require("./httpErrors");

exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
    return;
  }
  next(new UnauthorizedError());
};

exports.isMember = (githubOrganizationName) => async (req, res, next) => {
  const isUserPublicMemberOfOrg = await isOrgMember(
    req.session.accessToken,
    req.session.githubUsername,
    githubOrganizationName
  );
  if (isUserPublicMemberOfOrg) {
    next();
    return;
  }
  next(new UnauthorizedError());
};
