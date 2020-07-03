# nvr-backend
Network Video Recorder (NVR) using Node.js and FFMpeg

### npm install
```
$ npm install
```

### create record folder
```
$ mkdir record_datas
$ cd record_datas
$ mkdir disk1 disk2 disk3.....disk{n}
```

### run development mode
! before run development mode, follow instructions below.
- copy `.env.example` and rename it to `.env`.
- in `.env` please input the environment variabel below.

```
APP_ENV="dev"
APP_PORT=3001

JWT_SECRET=""

LOG_DIR="./logs"
```

```
$ npm run dev
```
