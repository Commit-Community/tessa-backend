const { agent } = require("supertest");
const express = require("express");
const expressSession = require("express-session");

const getUserId = jest.fn();

exports.mockUserId = (userId) => {
  getUserId.mockReturnValue(userId);
};

const getGithubUsername = jest.fn();

exports.mockGithubUsername = (githubUsername) => {
  getGithubUsername.mockReturnValue(githubUsername);
};

const sessionDestroyMock = jest.fn();
exports.sessionDestroyMock = sessionDestroyMock;

exports.createAppAgentForRouter = (router) => {
  const app = express();
  app.use(express.json());
  app.use(
    expressSession({
      resave: true,
      saveUninitialized: true,
      secret: "secret",
    })
  );
  app.use((req, res, next) => {
    req.session.destroy = sessionDestroyMock.mockImplementation(
      req.session.destroy
    );
    req.session.userId = getUserId();
    req.session.githubUsername = getGithubUsername();
    next();
  });
  app.use(router);
  return agent(app);
};
