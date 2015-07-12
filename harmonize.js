window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;

window.onload = function() {
  audioContext = new AudioContext();
}

function toggleLiveInput() {

}
