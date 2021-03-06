require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const multer = require('multer');
const upload = multer();
const cors = require('cors');
const port = process.env.PORT || 4000;
const mongoose = require('mongoose');
const fs = require('fs');
const {converter, receiver, comparator} = require('./utils');

mongoose.connect(`mongodb+srv://leonzalion:${process.env.DB_PASS}@dialek-tech-x0vqm.mongodb.net/test`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

app.use(cors());
app.set('view engine', 'html');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
});

app.post('/question', async (req, res) => {
  const { question } = req.body;
  const data = require('dcp-client').init().then(() => comparator(question)).finally(() => setImmediate(process.exit));
  console.log(data);
  res.json({...data});
});

app.post('/upload', upload.single('soundBlob'), function(req, res) {
  if (!req.file) return res.send("Please upload a file.");
  let uploadLocation = __dirname + '/public/uploads/audio.mp3'
  fs.writeFileSync(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer)));
  converter(uploadLocation);
  res.sendFile(path.join(__dirname, 'views/processing-video.html'));
});

app.get('/transcription', async (req, res) => {
  const {transcription} = await receiver('./public/uploads/audio.flac');
  res.json({data: transcription});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

const server = http.createServer(app);
server.listen(port, () => console.log(`listening on port ${port}`));
