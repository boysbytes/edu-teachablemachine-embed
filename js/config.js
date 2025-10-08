const CONFIG = {
  MODEL_URL: "https://teachablemachine.withgoogle.com/models/YFgzqdy36/",
  WEBCAM_WIDTH: 640,
  WEBCAM_HEIGHT: 480,
  FLIP_HORIZONTAL: true,
  // Set to 0.0 to show all class probabilities returned by the model
  CONFIDENCE_THRESHOLD: 0.0,
  MAX_PREDICTIONS: null
};

const APP_STATE = {
  model: null,
  webcam: null,
  maxPredictions: 0,
  isPredicting: false,
  rafId: null,
  currentMode: "idle",
  uploadObjectUrl: null
};

// Function to update the model URL
function setModelUrl(url) {
  CONFIG.MODEL_URL = url;
}
