var CALIBRATE_TIME = 300;

var calibrateFreqs = []; 
var calibrate = false;
var calibrateCountdown = CALIBRATE_TIME;
var calibratedFreq = null;

var countdownElem = document.querySelector('.countdown').childNodes[0];
var calibrateElem = document.querySelector('.calibrate').childNodes[0];
var rawFreqElem = document.querySelector('.rawFreq').childNodes[0];

var stopCalibrate = true;


function toggleCalibrate() {
  stopCalibrate = !stopCalibrate;
  if (!stopCalibrate) {
    getUserMedia({
      "audio": {
        "mandatory": {
          "googEchoCancellation": "false",
          "googAutoGainControl": "false",
          "googNoiseSuppression": "false",
          "googHighpassFilter": "false"
        },
        "optional": []
      },  
    }, gotCalibrateStream);
  }
}

function gotCalibrateStream(stream) {
  var mediaStreamSource = audioContext.createMediaStreamSource(stream);
  analyzerNode = audioContext.createAnalyser();
  mediaStreamSource.connect(analyzerNode);
  calibratePitch();
}

function calibratePitch() {
  if (stopCalibrate) {
    rawFreqElem.textContent = 0;
    calibrateCountdown = CALIBRATE_TIME;
    calibratedFreq = extractDominantFrequency(calibrateFreqs);
    countdownElem.textContent = CALIBRATE_TIME;
    calibrateElem.textContent = Math.round(calibratedFreq);
    return;
  }
  calibrateCountdown--;
  countdownElem.textContent = calibrateCountdown;
  if (calibrateCountdown < 0) {
    stopCalibrate = true;
  }

  analyzerNode.getFloatTimeDomainData(buf);
  pitch.input(buf);
  pitch.process();
  var tone = pitch.findTone();

  if (tone && tone.db > DB_THRESH &&
      tone.freq > FREQ_MIN &&
      tone.freq < FREQ_MAX) {
    rawFreqElem.textContent = Math.round(tone.freq);
    calibrateFreqs.push(tone.freq);
  } else {
    rawFreqElem.textContent = 0;
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  }
  window.requestAnimationFrame(calibratePitch);
}

