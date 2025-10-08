# GitHub Copilot Instructions

This document provides guidance for AI agents working on the Teachable Machine Embed project.

## Project Overview

This is a static single-page web application that embeds a pre-trained Teachable Machine image model. It allows users to classify images from either a live webcam feed or a file upload. The project is designed for easy deployment on Vercel.

The core functionality is built with vanilla JavaScript, HTML, and CSS. There are no external build tools or frameworks.

## Key Files and Architecture

The application logic is split into three main files:

-   **`index.html`**: The main entry point and UI structure. It contains all the DOM elements that the JavaScript interacts with.
-   **`js/config.js`**: Defines two global objects:
    -   `CONFIG`: Stores static configuration like the model URL, webcam dimensions, and confidence thresholds.
    -   `APP_STATE`: Holds the dynamic state of the application, such as the loaded model instance, webcam object, and current prediction mode.
-   **`js/model.js`**: This is the main logic file. It handles:
    -   Loading the Teachable Machine model.
    -   Initializing and controlling the webcam.
    -   Handling image uploads.
    -   Running predictions on images/webcam frames.
    -   Updating the UI with prediction results.

All the JavaScript in `js/model.js` is wrapped in an IIFE to avoid polluting the global scope.

## Development Workflow

1.  **Installation**: Run `npm install`. This is primarily to ensure a consistent `package-lock.json`, as there are no runtime dependencies.
2.  **Local Server**: Run `npm run start` to launch a simple static file server. This is useful for local development. Note that webcam access typically requires HTTPS, so you may need to use a different server or a tool like `ngrok` for full testing.
3.  **Making Changes**:
    -   UI changes are made in `index.html` and `css/styles.css`.
    -   Logic changes are made in `js/model.js`.
    -   Configuration changes (like the model URL) are made in `js/config.js`.

## Code Conventions

-   **State Management**: All application state is managed through the `APP_STATE` object in `js/config.js`. When adding new stateful properties, add them to this object.
-   **UI Interaction**: UI elements are cached in the `ui` object at the top of `js/model.js`. When adding new interactive elements, add them to this cache in the `cacheUiElements` function.
-   **Asynchronous Operations**: The application makes heavy use of `async/await` for loading the model and handling the webcam. Ensure that promises are handled correctly.
-   **Webcam Prediction Loop**: The webcam prediction runs in a `requestAnimationFrame` loop in `predictWebcam()`. This loop is throttled by `PREDICTION_INTERVAL` to manage performance.

## External Dependencies

-   **Teachable Machine Image Library**: The core library for image classification is loaded from a CDN in `index.html`. The global object `tmImage` is used to access its functionality.
-   **Vercel**: The project is configured for deployment on Vercel. The `vercel.json` file contains configuration for headers.

When making changes, please ensure they are consistent with the existing patterns and the simple, dependency-free nature of this project.
