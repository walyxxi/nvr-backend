const router = require("express").Router();
const path = require("path");
const { logger } = require("../../core/logger");
const moment = require("moment");
const Recorder = require("node-rtsp-recorder").Recorder;
const FileHandler = require("node-rtsp-recorder").FileHandler;
const fh = new FileHandler();
const fs = require("fs");

let drive = "drive1";

router.post("/", (req, res) => {
  const time = 10;
  const dir = path.join(__dirname, `../../../record_datas`);
  try {
    const registerRecord = (data) => {
      return new Recorder({
        url: data.url,
        timeLimit: time, // time in seconds for each segmented video file
        folder: `${dir}/${drive}`,
        name: data.name,
      });
    };

    let rec = registerRecord(req.body);

    // Starts Recording
    rec.startRecording();

    setInterval(() => {
      rec.stopRecording();
      fh.getDirectorySize(`${dir}/${drive}`, (err, size) => {
        if (err) console.log(err);

        if (size > 3000000 * (80 / 100)) {
          // drive === "drive1" ? (drive = "drive2") : (drive = "drive1");
          if (drive === "drive1") {
            drive = "drive2";
          } else if (drive === "drive2") {
            drive = "drive3";
          } else {
            drive = "drive1";
          }
          rec = null;
          rec = registerRecord(req.body);
          rec.startRecording();
        } else {
          rec = null;
          rec = registerRecord(req.body);
          rec.startRecording();
        }
      });

      let other_drive = null;
      if (drive === "drive1") {
        other_drive = "drive2";
      } else if (drive === "drive2") {
        other_drive = "drive3";
      } else {
        other_drive = "drive1";
      }
      const nextDir = `${dir}/${other_drive}/${req.body.name}/`;
      fs.readdir(nextDir, (err, files) => {
        if (files) {
          fs.unlink(nextDir + files[0], (err, d) => {
            if (err) console.log(err);
          });
        }
      });
    }, time * 1000);
    res.status(202).send({
      msg: `Start Record ${req.body.name}`,
    });
  } catch (error) {
    logger.info(error);
    res.status(400).send({
      msg: `Record ${req.body.name} Not Start`,
    });
  }
});

module.exports = router;
