const out3 = document.getElementsByClassName('output3')[0];
const canvasCtx3 = out3.getContext('2d');
const fpsControl = new FPS();

const levelSpeed = document.querySelectorAll('.level');
const fan = document.querySelector('.blades')
const noCameraDiv = document.getElementById('no-camera');

// Intentar acceder a la cámara
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    // Mostrar canvas y ocultar el div de error
    out3.style.display = 'block';
    noCameraDiv.style.display = 'none';

    // Asignar el stream al video
    video3.srcObject = stream;
    video3.play();

    // Iniciar MediaPipe después de confirmar la cámara
    const camera = new Camera(video3, {
      onFrame: async () => await hands.send({ image: video3 }),
      width: 480,
      height: 480
    });
    camera.start();
  })
  .catch((err) => {
    console.error('Camera not available:', err);

    out3.style.display = 'none';
    noCameraDiv.style.display = 'flex';
  });

function countFingers(landmarks) {
  const fingerTips = [8, 12, 16, 20]; // Índices de las puntas de los dedos
  let fingerCount = 0;

  fingerTips.forEach((tip) => {
    if (landmarks[tip].y < landmarks[tip - 2].y) {
      fingerCount += 1;
    }
  });

  return fingerCount;
}

function onResultsHands(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();

  canvasCtx3.save();
  canvasCtx3.clearRect(0, 0, out3.width, out3.height);
  canvasCtx3.drawImage(results.image, 0, 0, out3.width, out3.height);

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx3, landmarks, HAND_CONNECTIONS, { color: '#00FF00' });
      drawLandmarks(canvasCtx3, landmarks, { color: '#FF0000', fillColor: '#00FF00' });

      const fingers = countFingers(landmarks);
      if (fingers === 0) {
        currentLevel(fingers)
        speed(fingers)
      } else if (fingers === 1) {
        currentLevel(fingers)
        speed(fingers + 1)
      } else if (fingers === 2) {
        currentLevel(fingers)
        speed(fingers - 1)
      } else if (fingers === 3) {
        currentLevel(fingers)
        speed(fingers - 2.5)
      }
    }
  }

  canvasCtx3.restore();
}

const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}` });
hands.onResults(onResultsHands);

const video3 = document.createElement('video');
const camera = new Camera(video3, {
  onFrame: async () => await hands.send({ image: video3 }),
  width: 480,
  height: 480
});
camera.start();

new ControlPanel(document.querySelector('.control3'), {
  selfieMode: true,
  maxNumHands: 2,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
})
  .add([
    new StaticText({ title: 'MediaPipe Hands' }),
    fpsControl,
    new Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new Slider({ title: 'Max Number of Hands', field: 'maxNumHands', range: [1, 4], step: 1 }),
    new Slider({ title: 'Min Detection Confidence', field: 'minDetectionConfidence', range: [0, 1], step: 0.01 }),
    new Slider({ title: 'Min Tracking Confidence', field: 'minTrackingConfidence', range: [0, 1], step: 0.01 })
  ])
  .on((options) => {
    video3.classList.toggle('selfie', options.selfieMode);
    hands.setOptions(options);
  });


function currentLevel(level) {
  levelSpeed.forEach(l => {
    l.classList.remove('current-level')
  })
  levelSpeed[level].classList.add('current-level')
}

function speed(value) {
  fan.style.animationDuration = `${value}s`
}