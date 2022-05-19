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
  if (!req.session.githubUsername) {
    next(new UnauthorizedError());
    return;
  }
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

exports.isAdmin = (req, res, next) => {
  // HACK While the project is being bootstrapped, userId = 1 will be
  //      predictably someone who is rightfully an administrator.
  if (req.session.userId === "1") {
    next();
    return;
  }
  next(new UnauthorizedError());
};
