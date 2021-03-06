const speech = require("@google-cloud/speech");
const fs = require("fs");

module.exports = async (fileName) => {
  //removed the filename line

  const client = new speech.SpeechClient();

  const config = {
    enableWordTimeOffsets: true,
    encoding: "FLAC",
    // sampleRateHertz: 16000,
    languageCode: "en-US",
  };

  const audio = {
    content: fs.readFileSync(fileName).toString("base64"),
  };

  const request = {
    config: config,
    audio: audio,
  };

  const [operation] = await client.longRunningRecognize(request);

  const [response] = await operation.promise();
  console.log(response);
  var transcription = "";
  var worddict = {};
  for (const result of response.results) {
    console.log(`Transcription: ${result.alternatives[0].transcript}`);
    transcription += result.alternatives[0].transcript;
    result.alternatives[0].words.forEach((wordInfo) => {
      const startSecs =
        `${wordInfo.startTime.seconds}` +
        "." +
        wordInfo.startTime.nanos / 100000000;
      const endSecs =
        `${wordInfo.endTime.seconds}` +
        "." +
        wordInfo.endTime.nanos / 100000000;
      console.log(`Word: ${wordInfo.word}`);
      console.log(`\t ${startSecs} secs - ${endSecs} secs`);
      if (startSecs in worddict) {
        worddict[startSecs] += " " + wordInfo.word;
      } else {
        worddict[startSecs] = wordInfo.word;
      }
    });
  }

  fs.writeFileSync("./public/responses/response.txt", transcription);
  fs.writeFileSync(
    "./public/responses/response.json",
    JSON.stringify(worddict)
  );

  console.log("asoentuhs", transcription, worddict);
  return {
    transcription,
    timestamps: worddict
  }
};
  
