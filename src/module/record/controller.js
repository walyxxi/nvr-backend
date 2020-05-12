const router = require("express").Router();
const path = require("path");
const { logger } = require("../../core/logger");
const moment = require("moment");
const Recorder = require("node-rtsp-recorder").Recorder;
const FileHandler = require("node-rtsp-recorder").FileHandler;
const fh = new FileHandler();
const fs = require("fs");

let disk = "disk1";

router.post("/", (req, res) => {
  const time = 10; // time per-second
  const dir = path.join(__dirname, `../../../record_datas`);
  try {
    const registerRecord = (data) => {
      return new Recorder({
        url: data.url,
        timeLimit: time, // time in seconds for each segmented video file
        folder: `${dir}/${disk}`,
        name: data.name,
      });
    };

    let rec = registerRecord(req.body);

    // Starts Recording
    rec.startRecording();

    setInterval(() => {
      rec.stopRecording();
      fh.getDirectorySize(`${dir}/${disk}`, (err, size) => {
        if (err) console.log(err);

        if (size > 5000000 * (80 / 100)) {
          // disk === "disk1" ? (disk = "disk2") : (disk = "disk1");
          if (disk === "disk1") {
            disk = "disk2";
          } else if (disk === "disk2") {
            disk = "disk3";
          } else {
            disk = "disk1";
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

      let nextDisk = null;
      if (disk === "disk1") {
        nextDisk = "disk2";
      } else if (disk === "disk2") {
        nextDisk = "disk3";
      } else {
        nextDisk = "disk1";
      }

      const nextPath = `${dir}/${nextDisk}/${req.body.name}/`;
      fs.readdir(nextPath, (err, files) => {
        if (files) {
          fs.unlink(nextPath + files[0], (err, d) => {
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
      msg: `Record ${req.body.name} Error`,
    });
  }
});

module.exports = router;
