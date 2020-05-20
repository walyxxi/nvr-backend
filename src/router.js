const registerRouter = (app) => {
  app.use("/api/record", require("./module/record/controller"));
  app.use("/api/capture-image", require("./module/imageCapture/controller"));
};

module.exports = {
  registerRouter,
};
