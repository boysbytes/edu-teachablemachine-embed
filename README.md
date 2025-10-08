# Teachable Machine Embed

Interactive demo that embeds the [Teachable Machine image model](https://teachablemachine.withgoogle.com/models/YFgzqdy36/) inside a static web experience, ready to deploy on Vercel. The page supports both live webcam classification and manual image uploads, showing real-time confidence scores with a polished UI.

## Features

- ⚡️ Loads a Teachable Machine image model from its published URL (configurable in the UI)
- 🎥 Live webcam classification (throttled to reduce CPU and battery usage)
- 🖼️ Image upload fallback with client-side validation, preview, and size limits
- 📊 Prediction list with confidence bars and low-confidence messaging
- 🔒 Vercel configuration includes a permissive Content-Security header useful for embedding and model fetches

## Getting started

```powershell
# Install (no runtime dependencies required, lockfile only)
npm install

# Serve locally (uses the `serve` package via npx)
npm run start
```

Open the local server URL reported by `npx serve` (commonly http://localhost:5000) in a modern browser. For webcam access, you must use HTTPS (or a secure tunnel) and grant camera permission when prompted.

## Project structure

```
.
├── assets/              # Static assets (favicons, optional sample images)
├── css/styles.css       # UI styling and responsive layout
├── js/config.js         # Global configuration and shared app state
├── js/model.js          # Model loading, webcam and upload handling, UI updates
├── index.html           # Main application markup
├── package.json         # Project metadata and helper scripts
├── vercel.json          # Static hosting rules and security headers
└── .gitignore
```

## Implementation details

The README below documents key implementation details reflected in the codebase so you know how to customize and embed the demo.

- Libraries (loaded from CDN in `index.html`):
	- TensorFlow.js: `@tensorflow/tfjs@3.21.0`
	- Teachable Machine image helper: `@teachablemachine/image@0.8`

- Default model and how to change it:
	- The app ships with a default model URL in `js/config.js` (`CONFIG.MODEL_URL`).
	- You can paste your own Teachable Machine model URL into the input at the top of the page and click "Load Model". The URL is validated before attempting to load.
	- Programmatically you can also call the exported `setModelUrl(url)` function (defined in `js/config.js`) before initializing the app.

- Important configuration values (in `js/config.js`):
	- `WEBCAM_WIDTH`: 640
	- `WEBCAM_HEIGHT`: 480
	- `FLIP_HORIZONTAL`: true (mirrors webcam frames)
	- `CONFIDENCE_THRESHOLD`: 0.1 (filters very low-confidence predictions)

- Prediction behavior (in `js/model.js`):
	- Webcam predictions are throttled to approximately every 160 ms (PREDICTION_INTERVAL) to balance responsiveness and performance.
	- The app stops the webcam when the page becomes hidden and when the user stops the stream.

- Uploads and accepted formats:
	- The file input accepts `image/*` and the UI hints list JPEG, PNG, GIF, BMP.
	- Maximum file size: 10 MB. Files exceeding this limit are rejected client-side.

- Controls exposed in the UI:
	- "Start Webcam" / "Stop Webcam" buttons (start/stop live predictions)
	- Image upload input (analyze a single image)
	- Model URL input + "Load Model" button (swap to a different Teachable Machine model)

- Error handling and user feedback:
	- The app shows a loading indicator while the model is loading.
	- Errors from model loading or prediction are surfaced in the Predictions panel with friendly messages and logged to the console for debugging.

- Vercel headers (in `vercel.json`):
	- The repository includes a header that sets `Content-Security-Policy` allowing `frame-ancestors *` and permitting connections to `https://teachablemachine.withgoogle.com` so the published model can be fetched.

## Deployment (Vercel)

```powershell
# Authenticate once (will open browser)
vercel login

# First-time project setup and preview deployment
vercel

# Promote the latest build to production
vercel --prod
```

Vercel will serve the site over HTTPS by default, which is required for webcam access in most browsers.

## Troubleshooting

- Model fails to load: Check that the model URL is correct, publicly shared, and available (the app fetches `model.json` and `metadata.json`). Use the browser console for detailed fetch/CORS/network errors.
- Webcam not available: Ensure the page is served over HTTPS and that the browser granted camera permission. If permission is denied, the app falls back to the image upload workflow.
- Slow predictions or high CPU usage: Close other resource-heavy tabs, or switch to image upload mode. The app throttles webcam predictions (~160 ms) but older devices may still struggle.
- Upload errors: Ensure the file is an image and under 10 MB.

## Embedding via iframe

You can embed this demo inside another webpage using an iframe. The following snippet shows the recommended iframe markup (it includes permission flags for camera and microphone access and sets a sensible height):

<p>
	<iframe 
		style="width: 100%; height: 900px; border: none;" 
		src="https://edu-teachablemachine-embed.vercel.app/"
		allow="camera; microphone">
	</iframe>
</p>

Recommended height

For most desktop layouts a height between 700–900px works well. If you're embedding into a page where vertical space is limited, consider a lower fixed height (e.g., 600px). A better approach for responsive layouts is to size the iframe using viewport-relative units or CSS with min/max constraints so it adapts across devices.

Fixed-height example (recommended default):

<p>
	<iframe
		style="width: 100%; height: 700px; border: none;"
		src="https://edu-teachablemachine-embed.vercel.app/"
		allow="camera; microphone">
	</iframe>
</p>

Responsive example (preferred):

<p>
	<iframe
		style="width: 100%; height: 80vh; min-height: 500px; max-height: 900px; border: none;"
		src="https://edu-teachablemachine-embed.vercel.app/"
		allow="camera; microphone">
	</iframe>
</p>

Notes:

- Camera permissions: Browsers require that the embedding page and the iframe are served over HTTPS for getUserMedia to work. The user will still need to grant camera permission when prompted.
- Responsiveness: Adjust the `height` (or use CSS to size the iframe responsively) to fit your layout, especially on mobile.
- Privacy: Inform users that the iframe requests access to their camera. The demo runs entirely client-side and does not upload video frames to a server by default.
