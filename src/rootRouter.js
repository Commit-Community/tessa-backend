const { Router } = require("express");

const rootRouter = new Router();

rootRouter.get("/", (req, res) => {
  res.json({});
});

module.exports = rootRouter;
