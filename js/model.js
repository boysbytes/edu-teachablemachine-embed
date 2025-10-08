(function () {
  const UI_MODE_TEXT = {
    idle: "Model ready. Start the webcam or upload an image.",
    loading: "Loading Teachable Machine model…",
    webcam: "Webcam mode active. Move into frame to classify.",
    upload: "Image mode active. Upload a new image to classify.",
    error: "Model unavailable. Please refresh and try again."
  };

  const ui = {
    startWebcam: null,
    stopWebcam: null,
    uploadInput: null,
    loadingIndicator: null,
    loadingText: null,
    modeIndicator: null,
    webcamContainer: null,
    predictionResults: null,
    uploadedImageWrapper: null,
    uploadedImage: null,
    modelUrlInput: null,
    loadModelButton: null
  };

  let lastPredictionAt = 0;
  const PREDICTION_INTERVAL = 160; // milliseconds between webcam predictions

  function cacheUiElements() {
    ui.startWebcam = document.getElementById("start-webcam");
    ui.stopWebcam = document.getElementById("stop-webcam");
    ui.uploadInput = document.getElementById("image-upload");
    ui.loadingIndicator = document.getElementById("loading-indicator");
    ui.loadingText = ui.loadingIndicator?.querySelector("span");
    ui.modeIndicator = document.getElementById("mode-indicator");
    ui.webcamContainer = document.getElementById("webcam-container");
    ui.predictionResults = document.getElementById("prediction-results");
    ui.uploadedImageWrapper = document.getElementById("uploaded-image-wrapper");
    ui.uploadedImage = document.getElementById("uploaded-image");
    ui.modelUrlInput = document.getElementById("model-url");
    ui.loadModelButton = document.getElementById("load-model");
  }

  function setMode(mode) {
    APP_STATE.currentMode = mode;
    if (ui.modeIndicator) {
      ui.modeIndicator.textContent = UI_MODE_TEXT[mode] ?? "";
    }
  }

  function setLoading(isLoading, message = UI_MODE_TEXT.loading) {
    if (!ui.loadingIndicator) return;
    if (isLoading) {
      ui.loadingIndicator.classList.remove("hidden");
      ui.loadingIndicator.removeAttribute("hidden");
      if (ui.loadingText) ui.loadingText.textContent = message;
      if (ui.modeIndicator) {
        ui.modeIndicator.textContent = message;
      }
    } else {
      ui.loadingIndicator.classList.add("hidden");
      ui.loadingIndicator.setAttribute("hidden", "true");
      if (ui.modeIndicator) {
        const current = UI_MODE_TEXT[APP_STATE.currentMode] ?? "";
        ui.modeIndicator.textContent = current;
      }
    }
  }

  function enableControls() {
    ui.startWebcam.disabled = false;
    ui.uploadInput.disabled = false;
  }

  function disableControls() {
    ui.startWebcam.disabled = true;
    ui.stopWebcam.disabled = true;
    ui.uploadInput.disabled = true;
  }

  function resetMediaViews() {
    ui.webcamContainer.setAttribute("hidden", "true");
    ui.uploadedImageWrapper.setAttribute("hidden", "true");
    if (APP_STATE.uploadObjectUrl) {
      URL.revokeObjectURL(APP_STATE.uploadObjectUrl);
      APP_STATE.uploadObjectUrl = null;
      ui.uploadedImage.src = "";
    }
  }

  function isValidTeachableMachineUrl(url) {
    if (!url) return false;

    try {
      const urlObj = new URL(url);
      // Check if it's a Teachable Machine URL
      if (!urlObj.hostname.includes('teachablemachine.withgoogle.com')) {
        return false;
      }
      // Check if it has the correct path structure
      if (!urlObj.pathname.startsWith('/models/')) {
        return false;
      }
      // Ensure it ends with a model ID (not empty after /models/)
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length !== 2 || pathParts[0] !== 'models' || !pathParts[1]) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async function initModel(modelUrl = null) {
    try {
      setLoading(true);
      const baseUrl = modelUrl || CONFIG.MODEL_URL;

      // Validate URL format
      if (!isValidTeachableMachineUrl(baseUrl)) {
        throw new Error("Invalid Teachable Machine URL format. URL should be in the format: https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/");
      }

      const modelURL = `${baseUrl}model.json`;
      const metadataURL = `${baseUrl}metadata.json`;

      console.log(`Loading model from: ${modelURL}`);
      console.log(`Loading metadata from: ${metadataURL}`);

      APP_STATE.model = await tmImage.load(modelURL, metadataURL);
      APP_STATE.maxPredictions = APP_STATE.model.getTotalClasses();
      CONFIG.MAX_PREDICTIONS = APP_STATE.maxPredictions;

      setLoading(false);
      enableControls();
      ui.stopWebcam.disabled = true;
      setMode("idle");
      renderEmptyState();
      console.info(`Model loaded with ${APP_STATE.maxPredictions} classes.`);
    } catch (error) {
      console.error("Failed to load Teachable Machine model", error);
      setLoading(false);
      disableControls();

      // Provide more specific error messages
      let errorMessage = "Failed to load model.";
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        errorMessage = "Model not found. Please check that the model URL is correct and the model is publicly shared.";
      } else if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
        errorMessage = "CORS error: The model cannot be loaded due to cross-origin restrictions. The model may not be publicly accessible.";
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = "Network error: Please check your internet connection and try again.";
      } else if (error.message.includes('weights')) {
        errorMessage = "Model weights file not accessible. The model may not be properly exported or shared.";
      } else if (error.message.includes("Invalid Teachable Machine URL")) {
        errorMessage = error.message;
      }

      renderError(errorMessage + " (Check browser console for details)");
      setMode("error");
    }
  }

  async function setupWebcam() {
    if (!APP_STATE.model) {
      renderError("Model is not ready yet. Please wait a moment.");
      return;
    }

    try {
      stopWebcam();
      setMode("webcam");
      setLoading(true, "Requesting camera access…");

      APP_STATE.webcam = new tmImage.Webcam(
        CONFIG.WEBCAM_WIDTH,
        CONFIG.WEBCAM_HEIGHT,
        CONFIG.FLIP_HORIZONTAL
      );
      await APP_STATE.webcam.setup();
      await APP_STATE.webcam.play();

      ui.webcamContainer.innerHTML = "";
      ui.webcamContainer.appendChild(APP_STATE.webcam.canvas);
      ui.webcamContainer.removeAttribute("hidden");
      ui.uploadedImageWrapper.setAttribute("hidden", "true");

      ui.startWebcam.disabled = true;
      ui.stopWebcam.disabled = false;

      APP_STATE.isPredicting = true;
      setLoading(false);
      setMode("webcam");
      lastPredictionAt = 0;
      scheduleNextPrediction();
    } catch (error) {
      console.error("Unable to start webcam", error);
      setLoading(false);
      renderError(
        error?.name === "NotAllowedError"
          ? "Camera access was denied. Please allow permissions or use image upload mode."
          : "Unable to start webcam. Please ensure your device has a camera and supports HTTPS."
      );
      setMode("error");
    }
  }

  function scheduleNextPrediction() {
    if (!APP_STATE.isPredicting) return;
    APP_STATE.rafId = window.requestAnimationFrame(predictWebcam);
  }

  async function predictWebcam() {
    if (!APP_STATE.model || !APP_STATE.webcam) {
      APP_STATE.isPredicting = false;
      return;
    }

    const now = performance.now();
    if (now - lastPredictionAt < PREDICTION_INTERVAL) {
      scheduleNextPrediction();
      return;
    }
    lastPredictionAt = now;

    APP_STATE.webcam.update();
    try {
      const predictions = await APP_STATE.model.predict(APP_STATE.webcam.canvas);
      displayPredictions(predictions);
    } catch (error) {
      console.error("Prediction failed", error);
      renderError("Prediction failed. Please restart the webcam.");
      stopWebcam();
      return;
    }

    scheduleNextPrediction();
  }

  function stopWebcam() {
    APP_STATE.isPredicting = false;
    if (APP_STATE.rafId) {
      window.cancelAnimationFrame(APP_STATE.rafId);
      APP_STATE.rafId = null;
    }

    if (APP_STATE.webcam) {
      APP_STATE.webcam.stop();
      APP_STATE.webcam = null;
    }

    if (ui.webcamContainer) {
      ui.webcamContainer.innerHTML = "";
      ui.webcamContainer.setAttribute("hidden", "true");
    }

    ui.startWebcam.disabled = false;
    ui.stopWebcam.disabled = true;

    if (APP_STATE.currentMode === "webcam") {
      setMode("idle");
    }
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const MAX_SIZE_MB = 10;
    if (!file.type.startsWith("image/")) {
      renderError("Unsupported file type. Please select an image file.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      renderError(`File is too large. Please choose an image under ${MAX_SIZE_MB} MB.`);
      return;
    }

    if (APP_STATE.uploadObjectUrl) {
      URL.revokeObjectURL(APP_STATE.uploadObjectUrl);
      APP_STATE.uploadObjectUrl = null;
    }

    stopWebcam();
    resetMediaViews();
    setMode("upload");

    const objectUrl = URL.createObjectURL(file);
    APP_STATE.uploadObjectUrl = objectUrl;
    ui.uploadedImage.src = objectUrl;

    ui.uploadedImage.onload = () => {
      runImagePrediction(ui.uploadedImage);
    };

    ui.uploadedImage.onerror = () => {
      renderError("Unable to load the selected image. Please try another file.");
    };

    ui.uploadedImageWrapper.removeAttribute("hidden");
    event.target.value = "";
  }

  async function runImagePrediction(imageElement) {
    if (!APP_STATE.model) {
      renderError("Model is not ready yet. Please wait a moment.");
      return;
    }

    try {
      setLoading(true, "Analyzing image…");
      const predictions = await APP_STATE.model.predict(imageElement, false);
      displayPredictions(predictions);
      setLoading(false);
      setMode("upload");
    } catch (error) {
      console.error("Image prediction failed", error);
      setLoading(false);
      renderError("Image prediction failed. Please try another image.");
    }
  }

  function displayPredictions(predictions) {
    if (!Array.isArray(predictions) || !ui.predictionResults) {
      return;
    }

    if (!predictions.length) {
      renderEmptyState();
      return;
    }

    const sorted = [...predictions].sort((a, b) => b.probability - a.probability);

    ui.predictionResults.innerHTML = "";

    sorted.forEach((prediction, index) => {
      if (prediction.probability < CONFIG.CONFIDENCE_THRESHOLD) {
        return;
      }
      const probabilityPct = Math.round(prediction.probability * 1000) / 10;

      const item = document.createElement("div");
      item.className = "prediction-item";
      if (index === 0) {
        item.classList.add("top-prediction");
      }

      const className = document.createElement("span");
      className.className = "class-name";
      className.textContent = prediction.className;

      const probability = document.createElement("span");
      probability.className = "probability";
      probability.textContent = `${probabilityPct.toFixed(1)}%`;

      const progressBar = document.createElement("div");
      progressBar.className = "progress-bar";

      const progressFill = document.createElement("div");
      progressFill.className = "progress-fill";
      progressFill.style.width = `${Math.min(probabilityPct, 100)}%`;

      progressBar.appendChild(progressFill);

      item.appendChild(className);
      item.appendChild(probability);
      item.appendChild(progressBar);

      ui.predictionResults.appendChild(item);
    });

    if (!ui.predictionResults.children.length) {
      renderEmptyState("Low confidence across all classes.");
    }
  }

  function renderEmptyState(message = "No predictions to show yet.") {
    if (!ui.predictionResults) return;
    ui.predictionResults.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = message;
    ui.predictionResults.appendChild(empty);
  }

  function renderError(message) {
    if (!ui.predictionResults) return;
    ui.predictionResults.innerHTML = "";
    const error = document.createElement("div");
    error.className = "error-message";
    error.textContent = message;
    ui.predictionResults.appendChild(error);
  }

  function handleVisibilityChange() {
    if (document.hidden && APP_STATE.currentMode === "webcam") {
      stopWebcam();
    }
  }

  async function loadModelFromInput() {
    const url = ui.modelUrlInput.value.trim();
    if (!url) {
      alert("Please enter a Teachable Machine model URL.");
      return;
    }

    // Stop any current webcam or prediction
    if (APP_STATE.isPredicting) {
      stopWebcam();
    }

    // Reset the current model
    APP_STATE.model = null;
    disableControls();

    try {
      await initModel(url);
      // Update the config with the new URL
      setModelUrl(url);
      console.log(`Model URL updated to: ${url}`);
    } catch (error) {
      // Error handling is already done in initModel
      console.error("Failed to load model from input:", error);
    }
  }

  function bindEvents() {
    ui.startWebcam.addEventListener("click", setupWebcam);
    ui.stopWebcam.addEventListener("click", stopWebcam);
    ui.uploadInput.addEventListener("change", handleImageUpload);
    ui.loadModelButton.addEventListener("click", loadModelFromInput);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", () => {
      stopWebcam();
      if (APP_STATE.uploadObjectUrl) {
        URL.revokeObjectURL(APP_STATE.uploadObjectUrl);
      }
    });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    cacheUiElements();
    disableControls();
    bindEvents();
    await initModel();
  });
})();
