# Teachable Machine Embed

Interactive demo that embeds the [Teachable Machine image model](https://teachablemachine.withgoogle.com/models/YFgzqdy36/) inside a static web experience, ready to deploy on Vercel. The page supports both live webcam classification and manual image uploads, showing real-time confidence scores with polished UI feedback.

## Features

- ⚡️ Loads the published Teachable Machine model directly from its hosted URL
- 🎥 Live webcam classification with throttled predictions for smooth performance
- 🖼️ Image upload fallback with client-side validation and previews
- 📊 Rich prediction display, including confidence bars and low-confidence messaging
- 🔒 Secure default headers via `vercel.json` and permission-aware UI states

## Getting started

```powershell
# Install dependencies (none required for runtime, but ensures lockfile if desired)
npm install

# Serve locally with SSL-less static server (press Ctrl+C to stop)
npm run start
```

Then open <http://localhost:3000> (or the port reported by the CLI) in a modern browser. For webcam access, use HTTPS or enable the `--ssl` flag with your preferred static server.

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

## Deployment (Vercel)

```powershell
# Authenticate once (will open browser)
vercel login

# First-time project setup and preview deployment
vercel

# Promote the latest build to production
vercel --prod
```

Key settings are already present in `vercel.json`, so no additional configuration is required for static hosting. Vercel automatically provisions HTTPS certificates and provides preview URLs for each deployment.

## Browser support

- Works best on Chromium-based browsers (Chrome, Edge, Brave) with webcam access
- Firefox and Safari are supported, but camera permission prompts may differ
- Mobile browsers require HTTPS and user interaction to start the camera

If webcam access is denied or unsupported, the upload workflow remains available as a fallback.

## Troubleshooting

- **Model fails to load**: Confirm internet connectivity and that the Teachable Machine model URL is still published.
- **Webcam not available**: Ensure the page is served over HTTPS and that browser permissions allow camera usage.
- **Slow predictions**: Close other intensive tabs or disable webcam mode and use single-image uploads instead.
