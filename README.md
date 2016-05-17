Autoharmonizer
==============

A pretty buggy app that's intended to automatically harmonize with your singing. For now, you can play with it by cloning the repo and serving it on localhost.
This uses [pitch.js](https://github.com/audiocogs/pitch.js) and [fft.js](https://github.com/JensNockert/fft.js).

To run:
-------
```bash
git clone --recursive https://github.com/echentw/autoharmonizer.git
cd autoharmonizer/
python -m SimpleHTTPServer 8080
```
and you can access the app in your browser at localhost:8080.
