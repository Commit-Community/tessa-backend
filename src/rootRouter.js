const express = require("express");

const rootRouter = express.Router();

rootRouter.get("/", (req, res) => {
  res.json({});
});

module.exports = rootRouter;
