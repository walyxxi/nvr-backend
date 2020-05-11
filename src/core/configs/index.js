const _ = require("lodash");

const { PROD_ENV, DEV_ENV, TEST_ENV } = require("./constants");
const env = _.isNil(process.env.APP_ENV) ? "dev" : process.env.APP_ENV;

const isProd = () => env === PROD_ENV;
const isDev = () => env === DEV_ENV;
const isTest = () => env === TEST_ENV;

module.exports = {
  app: {
    env,
    port: process.env.APP_PORT,
  },
  jwt: {
    secret: process.env.JWT_SECRET ? process.env.JWT_SECRET : "dhfe8wdnfe",
  },
  log: {
    dir: process.env.LOG_DIR,
  },
  isProd,
  isDev,
  isTest,
};
