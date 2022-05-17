const db = require("./db");

exports.findUserByGithubId = async (githubId) => {
  const {
    rows: [user],
  } = await db.query(
    "SELECT id, github_id, github_username FROM users WHERE github_id = $1;",
    [githubId]
  );
  return user;
};

exports.createUser = async (githubId, githubUsername) => {
  const {
    rows: [user],
  } = await db.query(
    "INSERT INTO users (github_id, github_username) VALUES ($1, $2) RETURNING id, github_id, github_username;",
    [githubId, githubUsername]
  );
  return user;
};
