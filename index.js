// const { spawn } = require("child_process");
const moment = require("moment");
const Recorder = require("node-rtsp-recorder").Recorder;
const FileHandler = require("node-rtsp-recorder").FileHandler;
const fh = new FileHandler();
const fs = require("fs");

const cameraList = [
  {
    name: "Gerbang Utama",
    url: "rtsp://admin:1407@172.16.6.50:7070",
  },
  {
    name: "Lobby Utama",
    url: "rtsp://admin:1407@172.16.6.106:7070/stream2",
  },
];

let drive = "drive1";

const time = 10;

const registerRecord = (data) => {
  return new Recorder({
    url: data.url,
    timeLimit: time, // time in seconds for each segmented video file
    folder: `${__dirname}/record_datas/${drive}`,
    name: data.name,
  });
};

let rec = registerRecord(cameraList[0]);

// Starts Recording
rec.startRecording();

setInterval(() => {
  rec.stopRecording();
  fh.getDirectorySize(`${__dirname}/record_datas/${drive}`, (err, size) => {
    if (err) console.log(err);

    if (size >= 10000000 * (80 / 100)) {
      // drive === "drive1" ? (drive = "drive2") : (drive = "drive1");
      if (drive === "drive1") {
        drive = "drive2";
      } else if (drive === "drive2") {
        drive = "drive3";
      } else {
        drive = "drive1";
      }
      rec = null;
      rec = registerRecord(cameraList[0], drive);
      rec.startRecording();
    } else {
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
  const path = `${__dirname}/record_datas/${other_drive}/Gerbang Utama/${moment().format(
    "MM-DD-YYYY"
  )}/video/`;
  fs.readdir(path, (err, files) => {
    if (files) {
      fs.unlink(path + files[0], (err, d) => {
        if (err) console.log(err);
      });
    }
  });
}, time * 1000);
