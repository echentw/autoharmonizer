var a = Math.pow(2.0, 1.0/12) // 12th root of 2
var dominantFraction = 0.3

function extractDominantFrequency(freqs) {
  if (freqs.length == 0) {
    return null;
  }
  var scores = getScores(freqs);
  var maxScore = Math.max.apply(null, scores);
  var bestFreqs = getBestFreqs(scores, freqs, maxScore);
  var geoMean = geometricMean(bestFreqs);
  return geoMean;
}

function extractFundamentalFrequency(freqs) {
  if (freqs.length == 0) {
    return null;
  }
  nonzeroFreqs = [];
  for (var i = 0; i < freqs.length; ++i) {
    if (freqs[i] > 20 && freqs[i] < 800) {
      nonzeroFreqs.push(freqs[i]);
    }
  }
  if (nonzeroFreqs.length < 2) {
    return 0;
  }
  var scores = getScores(nonzeroFreqs);
  var threshold = nonzeroFreqs.length * dominantFraction;
  var fundamentalFrequency = nonzeroFreqs[0];
  for (var i = 0; i < nonzeroFreqs.length; ++i) {
    if (scores[i] > threshold && nonzeroFreqs[i] < fundamentalFrequency) {
      fundamentalFrequency = nonzeroFreqs[i];
    }
  }
  return fundamentalFrequency;
}

function getNoteFromFreq(refNote, calibratedFreq, freq) {
  return 50 + Math.round( Math.log(freq / calibratedFreq) / Math.log(a) );
}

function getFreqFromNote(refNote, calibratedFreq, note) {
  return calibratedFreq * Math.pow(a, note - refNote);
}

function getScores(freqs) {
  var scores = [];
  for (var i = 0; i < freqs.length; ++i) {
    scores.push(0);
    for (var j = 0; j < freqs.length; ++j) {
      if (Math.abs(freqs[i] - freqs[j]) < freqs[i] * 0.03) {
        scores[i]++;
      }
    }
  }
  return scores;
}

function getBestFreqs(scores, freqs, maxScore) {
  var bestFreqs = [];
  for (var i = 0; i < freqs.length; ++i) {
    if (scores[i] == maxScore) {
      bestFreqs.push(freqs[i]);
    }
  }
  return bestFreqs;
}

function geometricMean(a) {
  for (var i = 0; i < a.length; ++i) {
    a[i] = Math.log(a[i]);
  }
  var logMean = 0.0;
  for (var i = 0; i < a.length; ++i) {
    logMean += a[i];
  }
  logMean /= a.length;
  var geoMean = Math.exp(logMean);
  return geoMean;
}

