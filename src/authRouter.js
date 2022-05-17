const { Router } = require("express");

const { BadRequestError } = require("./httpErrors");
const { createUser, findUserByGithubId } = require("./usersService");
const { getAccessToken, getGithubUser } = require("./githubService");
const { itemEnvelope } = require("./responseEnvelopes");

const authRouter = new Router();

authRouter.get("/github/login", (req, res) => {
  const params = new URLSearchParams();
  params.set("client_id", process.env.GITHUB_CLIENT_ID);
  params.set("redirect_uri", process.env.GITHUB_REDIRECT_URI);
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

authRouter.get("/github/oauth/callback", async (req, res, next) => {
  const { code } = req.query;
  if (!code) {
    next(new BadRequestError('A "code" query string parameter is required.'));
    return;
  }
  const accessToken = await getAccessToken(code);
  const githubUser = await getGithubUser(accessToken);
  let user = await findUserByGithubId(githubUser.id);
  if (!user) {
    user = await createUser(githubUser.id, githubUser.login);
  }
  req.session.userId = user.id;
  req.session.githubUsername = user.github_username;
  res.redirect(process.env.WEBAPP_ORIGIN);
});

authRouter.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect(process.env.WEBAPP_ORIGIN);
  });
});

authRouter.get("/session", (req, res) => {
  res.json(
    itemEnvelope({
      user_id: req.session.userId,
      github_username: req.session.githubUsername,
    })
  );
});

module.exports = authRouter;
