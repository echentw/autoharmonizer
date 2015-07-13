var a = Math.pow(2.0, 1.0/12) // 12th root of 2

function extractDominantFrequency(freqs) {
  if (freqs.length == 0) {
    return null;
  }

  var scores = [];
  for (var i = 0; i < freqs.length; ++i) {
    scores.push(0);
    for (var j = 0; j < freqs.length; ++j) {
      if (Math.abs(freqs[i] - freqs[j]) < freqs[i] * 0.03) {
        scores[i]++;
      }
    }
  }

  var maxScore = Math.max.apply(null, scores);

  var bestFreqs = [];
  for (var i = 0; i < freqs.length; ++i) {
    if (scores[i] == maxScore) {
      bestFreqs.push(freqs[i]);
    }
  }

  // compute geometric mean of bestFreqs
  for (var i = 0; i < bestFreqs.length; ++i) {
    bestFreqs[i] = Math.log(bestFreqs[i]);
  }
  var logMean = 0.0;
  for (var i = 0; i < bestFreqs.length; ++i) {
    logMean += bestFreqs[i];
  }
  logMean /= bestFreqs.length;
  var geoMean = Math.exp(logMean);

  return geoMean;
}

function getNoteFromFreq(refNote, calibratedFreq, freq) {
  return 50 + Math.round( Math.log(freq / calibratedFreq) / Math.log(a) );
}

