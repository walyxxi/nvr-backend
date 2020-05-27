const router = require("express").Router();
const path = require("path");
const { logger } = require("../../core/logger");
const glob = require("glob");
const fluent = require("fluent-ffmpeg");
const mergeVideo = fluent();

router.get("/", (req, res) => {
  const { camera, startTime, endTime, directory } = req.body;
  try {
    const getDirectories = (filter, callback) => {
      glob(
        path.join(__dirname, `../../../record_datas/*/${camera}/${filter}.avi`),
        callback
      );
    };

    getDirectories("*", (err, files) => {
      if (err) {
        console.log("Error", err);
      } else if (files) {
        files.sort((a, b) => {
          const x = a.split("/")[a.split("/").length - 1];
          const y = b.split("/")[b.split("/").length - 1];
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });

        const startTimeArray = [];
        const endTimeArray = [];
        startTime.split("-").map((e) => startTimeArray.push(parseInt(e)));
        endTime.split("-").map((e) => endTimeArray.push(parseInt(e)));
        const startDate = new Date(
          startTimeArray[0],
          startTimeArray[1],
          startTimeArray[2],
          startTimeArray[3],
          startTimeArray[4],
          startTimeArray[5]
        );
        const endDate = new Date(
          endTimeArray[0],
          endTimeArray[1],
          endTimeArray[2],
          endTimeArray[3],
          endTimeArray[4],
          endTimeArray[5]
        );

        const duration = Math.ceil(Math.abs(endDate - startDate) / 1000); // per second

        const getSecondFile = parseInt(files[0].slice(-6, -4));

        let getStartFileIndex = null;
        if (startTimeArray[5] < getSecondFile) {
          getStartFileIndex = files.findIndex((e) => {
            return e.includes(
              `${startTimeArray[0]}-${
                startTimeArray[1].toString().slice("").length === 1
                  ? "0" + startTimeArray[1]
                  : startTimeArray[1]
              }-${
                startTimeArray[2].toString().slice("").length === 1
                  ? "0" + startTimeArray[2]
                  : startTimeArray[2]
              }-${
                startTimeArray[3].toString().slice("").length === 1
                  ? "0" + startTimeArray[3]
                  : startTimeArray[3]
              }-${
                (startTimeArray[4] - 1).toString().slice("").length === 1
                  ? "0" + (startTimeArray[4] - 1)
                  : startTimeArray[4] - 1
              }`
            );
          });
        } else {
          getStartFileIndex = files.findIndex((e) => {
            return e.includes(startTime.slice(0, 16));
          });
        }

        let getEndFileIndex = null;
        if (endTimeArray[5] > getSecondFile) {
          getEndFileIndex = files.findIndex((e) => {
            return e.includes(endTime.slice(0, 16));
          });
        } else {
          getEndFileIndex = files.findIndex((e) => {
            return e.includes(
              `${endTimeArray[0]}-${
                endTimeArray[1].toString().slice("").length === 1
                  ? "0" + endTimeArray[1]
                  : endTimeArray[1]
              }-${
                endTimeArray[2].toString().slice("").length === 1
                  ? "0" + endTimeArray[2]
                  : endTimeArray[2]
              }-${
                endTimeArray[3].toString().slice("").length === 1
                  ? "0" + endTimeArray[3]
                  : endTimeArray[3]
              }-${
                (endTimeArray[4] - 1).toString().slice("").length === 1
                  ? "0" + (endTimeArray[4] - 1)
                  : endTimeArray[4] - 1
              }`
            );
          });
        }

        const getStartFile = files[getStartFileIndex]
          .split("/")
          [files[getStartFileIndex].split("/").length - 1].slice(0, -4)
          .split("-")
          .map((e) => {
            return parseInt(e);
          });

        const getStartFileDate = new Date(
          getStartFile[0],
          getStartFile[1],
          getStartFile[2],
          getStartFile[3],
          getStartFile[4],
          getStartFile[5]
        );

        const setStartTime = Math.ceil(
          Math.abs(
            startDate > getStartFileDate
              ? startDate - getStartFileDate
              : getStartFileDate - startDate
          ) / 1000
        ); // per second

        for (let i = getStartFileIndex; i <= getEndFileIndex; i++) {
          mergeVideo.mergeAdd(files[i]);
        }

        mergeVideo
          .seekInput(setStartTime)
          .setDuration(duration)
          .on("error", (err) => {
            logger.info(err.message);
          })
          .on("end", () => {
            res.status(200).send({
              msg: `Capture footage video from ${camera} success!`,
            });
          })
          .mergeToFile(`${directory}/${camera}_${startTime}_${endTime}.avi`);
      }
    });
  } catch (err) {
    logger.info(err);
    res.status(400).send({
      msg: `Capture footage video from ${camera} unsuccess!`,
    });
  }
});

module.exports = router;
