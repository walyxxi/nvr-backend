require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const { isDev } = require("./core/configs");
const { registerRouter } = require("./router");

// middleware
const errorHandler = (err, req, res, next) => {
  return res.status(500).json({
    msg: "Something happend, please check your request.",
  });
};

const createApp = () => {
  const app = express();
  app.disable("x-powered-by");

  app.use(bodyParser.json());
  app.use(cors());
  app.use(express.static(path.join(__dirname, "../public")));

  if (!isDev()) {
    app.use(errorHandler());
  }

  registerRouter(app);
  return app;
};

module.exports = {
  createApp,
};
