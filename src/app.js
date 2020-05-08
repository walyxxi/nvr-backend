require("dotenv").config();
const http = require("http");

const { logger } = require("./core/logger");
const { createApp } = require("./server");

const app = createApp();
const server = http.createServer(app);

server.listen(process.env.APP_PORT, () => {
  logger.info("Server up...");
  logger.info(`http://localhost:${process.env.APP_PORT}`);
});
