const router = require("express").Router();
const { logger } = require("../../core/logger");
const Recorder = require("node-rtsp-recorder").Recorder;

router.get("/", (req, res) => {
  const { name, url, directory } = req.body;
  try {
    const rec = new Recorder({
      url,
      folder: directory,
      name,
      type: "image",
    });

    rec.captureImage(() => {
      res.status(200).send({
        msg: `Capture an Image ${name} success`,
      });
    });
  } catch (error) {
    logger.info(error);
    res.status(400).send({
      msg: `Capture an Image ${name} unsuccess`,
    });
  }
});

module.exports = router;
