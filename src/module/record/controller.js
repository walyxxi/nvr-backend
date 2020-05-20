const router = require("express").Router();
const path = require("path");
const { logger } = require("../../core/logger");
const Recorder = require("node-rtsp-recorder").Recorder;
const FileHandler = require("node-rtsp-recorder").FileHandler;
const fh = new FileHandler();
const fs = require("fs");
const glob = require("glob");

const totalDisk = 3;
let disk = "disk1";
let deleteOnDisk = null;

router.post("/start", (req, res) => {
  const time = 30; //time in second
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

    this["camera" + req.body.id] = registerRecord(req.body);

    // Starts Recording
    this["camera" + req.body.id].startRecording();

    this["interval" + req.body.id] = setInterval(() => {
      this["camera" + req.body.id].stopRecording();
      fh.getDirectorySize(`${dir}/${disk}`, (err, size) => {
        if (err) logger.info(err);

        if (size > 20000000 * (80 / 100)) {
          const setNextDisk = () => {
            const getDiskIndex = parseInt(disk.slice(-1));
            if (getDiskIndex < totalDisk) {
              disk = "disk" + (getDiskIndex + 1);
            } else {
              disk = "disk1";
            }
          };

          setNextDisk();

          const getDirectories = (filter, callback) => {
            glob(`${dir}/${disk}/*/${filter}.avi`, callback);
          };

          getDirectories("*", (err2, files) => {
            if (err2) {
              logger.info(err2);
            } else if (files) {
              files.forEach((file) => {
                fs.unlink(file, (err3) => {
                  logger.info(`${file} was deleted.`);
                });
              });
            }
          });

          this["camera" + req.body.id] = null;
          this["camera" + req.body.id] = registerRecord(req.body);
          this["camera" + req.body.id].startRecording();
        } else {
          this["camera" + req.body.id] = null;
          this["camera" + req.body.id] = registerRecord(req.body);
          this["camera" + req.body.id].startRecording();
        }
      });

      const setDeleteOnDisk = () => {
        const getDiskIndex = parseInt(disk.slice(-1));
        if (getDiskIndex < totalDisk) {
          deleteOnDisk = "disk" + (getDiskIndex + 1);
        } else {
          deleteOnDisk = "disk1";
        }
      };

      setDeleteOnDisk();

      const nextPath = `${dir}/${deleteOnDisk}/${req.body.name}/`;
      fs.readdir(nextPath, (err4, files) => {
        if (files) {
          fs.unlink(nextPath + files[0], (err) => {
            logger.info(`${nextPath}${files[0]} was deleted.`);
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

router.post("/stop", (req, res) => {
  try {
    this["camera" + req.body.id].stopRecording();
    this["camera" + req.body.id] = null;
    clearInterval(this["interval" + req.body.id]);
    res.status(202).send({
      msg: `Stop Record ${req.body.name}`,
    });
  } catch (error) {
    logger.info(error);
    res.status(400).send({
      msg: `Record ${req.body.name} Error`,
    });
  }
});

module.exports = router;
