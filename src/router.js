const registerRouter = (app) => {
  app.use("/api/record", require("./module/record/controller"));
};

module.exports = {
  registerRouter,
};
