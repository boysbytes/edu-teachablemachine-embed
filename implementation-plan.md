This is a **complete and deterministic implementation plan** for embedding a specific Teachable Machine model and deploying it on Vercel.

---

## **COMPLETE IMPLEMENTATION PLAN FOR AI AGENT**

### **PHASE 1: PROJECT SETUP & STRUCTURE**

**1.1 Directory Structure Creation**
```
project-root/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   └── model.js
├── assets/
│   └── (optional: test images, icons)
├── vercel.json
├── package.json
└── .gitignore
```

**1.2 Core Dependencies Identification**
- TensorFlow.js library (v3.21.0 or later)
- Teachable Machine Image library (v0.8 or later)
- Model URL: `https://teachablemachine.withgoogle.com/models/YFgzqdy36/`

**1.3 Vercel Configuration Files**

**package.json** (optional, for metadata):
```json
{
  "name": "teachable-machine-embed",
  "version": "1.0.0",
  "description": "Teachable Machine model deployment on Vercel",
  "scripts": {},
  "keywords": ["teachable-machine", "tensorflow", "image-classification"],
  "author": "",
  "license": "MIT"
}
```

**vercel.json** (for routing and configuration):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*.html",
      "use": "@vercel/static"
    },
    {
      "src": "css/**",
      "use": "@vercel/static"
    },
    {
      "src": "js/**",
      "use": "@vercel/static"
    },
    {
      "src": "assets/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(self), microphone=()"
        }
      ]
    }
  ]
}
```

**.gitignore**:
```
.vercel
node_modules/
.DS_Store
*.log
.env
.env.local
```

---

### **PHASE 2: HTML STRUCTURE IMPLEMENTATION**

**2.1 Base HTML File Creation (index.html)**

Required elements:
- DOCTYPE and HTML5 structure
- Meta tags for viewport and charset
- External library script tags (TensorFlow.js, Teachable Machine)
- Webcam video element OR image upload input
- Canvas for displaying webcam feed (if using webcam)
- Prediction results container
- Control buttons (start/stop webcam, upload image)
- Loading indicator

**2.2 HTML Components Specification**

```html
<!-- Library imports -->
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js"></script>

<!-- UI Elements -->
- <div id="webcam-container"> (for webcam mode)
- <input type="file" id="image-upload"> (for image upload mode)
- <div id="prediction-results">
- <button id="start-webcam">
- <button id="stop-webcam">
- <div id="loading-indicator">
```

---

### **PHASE 3: CONFIGURATION MODULE (config.js)**

**3.1 Define Constants**
```javascript
const CONFIG = {
    MODEL_URL: 'https://teachablemachine.withgoogle.com/models/YFgzqdy36/',
    WEBCAM_WIDTH: 640,
    WEBCAM_HEIGHT: 480,
    FLIP_HORIZONTAL: true,
    MAX_PREDICTIONS: null, // Will be set after model loads
};
```

**3.2 State Management Variables**
```javascript
let model = null;
let webcam = null;
let maxPredictions = 0;
let isPredicting = false;
```

---

### **PHASE 4: MODEL LOADING LOGIC (model.js)**

**4.1 Model Initialization Function**

```javascript
async function initModel() {
    // Steps:
    // 1. Show loading indicator
    // 2. Load model.json from MODEL_URL
    // 3. Load metadata.json from MODEL_URL
    // 4. Store model reference
    // 5. Get total number of classes
    // 6. Hide loading indicator
    // 7. Enable UI controls
}
```

Implementation details:
- Use `tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json")`
- Store result in `model` variable
- Extract `maxPredictions = model.getTotalClasses()`
- Add try-catch error handling
- Display error message if loading fails

**4.2 Error Handling Strategy**
- Network errors: Display "Failed to load model. Check internet connection."
- CORS errors: Inform user that model must be properly shared
- Invalid model URL: Display "Invalid model URL"
- Log all errors to console for debugging

---

### **PHASE 5: WEBCAM IMPLEMENTATION**

**5.1 Webcam Setup Function**

```javascript
async function setupWebcam() {
    // Steps:
    // 1. Initialize tmImage.Webcam with dimensions
    // 2. Request camera permissions
    // 3. Setup webcam
    // 4. Append webcam canvas to container
    // 5. Start webcam
    // 6. Begin prediction loop
}
```

Implementation details:
- Create: `webcam = new tmImage.Webcam(width, height, flip)`
- Call: `await webcam.setup()`
- Call: `await webcam.play()`
- Append: `document.getElementById("webcam-container").appendChild(webcam.canvas)`
- Start prediction loop with `requestAnimationFrame`

**5.2 Webcam Prediction Loop**

```javascript
async function predictWebcam() {
    // Steps:
    // 1. Update webcam frame
    // 2. Get prediction from model
    // 3. Update UI with predictions
    // 4. Schedule next prediction
}
```

Implementation details:
- `webcam.update()`
- `const prediction = await model.predict(webcam.canvas)`
- Process and display predictions
- Use `window.requestAnimationFrame(predictWebcam)` for continuous loop

**5.3 Webcam Stop Function**

```javascript
function stopWebcam() {
    // Steps:
    // 1. Stop prediction loop
    // 2. Stop webcam stream
    // 3. Remove webcam element from DOM
    // 4. Reset state variables
}
```

---

### **PHASE 6: IMAGE UPLOAD IMPLEMENTATION**

**6.1 File Input Handler**

```javascript
function handleImageUpload(event) {
    // Steps:
    // 1. Get file from event.target.files[0]
    // 2. Validate file type (image/*)
    // 3. Create FileReader
    // 4. Read file as data URL
    // 5. Create Image element
    // 6. Load image
    // 7. Run prediction on loaded image
}
```

Implementation details:
- Supported formats: JPG, PNG, GIF, BMP
- Max file size check (optional, e.g., 10MB)
- Display uploaded image on page
- Clear previous predictions

**6.2 Image Prediction Function**

```javascript
async function predictImage(imageElement) {
    // Steps:
    // 1. Ensure model is loaded
    // 2. Call model.predict(imageElement)
    // 3. Process prediction results
    // 4. Update UI with results
}
```

Implementation details:
- Use: `const prediction = await model.predict(imageElement, false)`
- Second parameter `false` means no data augmentation
- Results will be array of {className, probability}

---

### **PHASE 7: PREDICTION RESULTS DISPLAY**

**7.1 Results Rendering Function**

```javascript
function displayPredictions(predictions) {
    // Steps:
    // 1. Sort predictions by probability (descending)
    // 2. Format probability as percentage
    // 3. Create HTML for each prediction
    // 4. Add visual indicators (progress bars/colors)
    // 5. Update prediction-results container
}
```

HTML structure for each prediction:
```html
<div class="prediction-item">
    <span class="class-name">{className}</span>
    <span class="probability">{probability}%</span>
    <div class="progress-bar">
        <div class="progress-fill" style="width: {probability}%"></div>
    </div>
</div>
```

**7.2 Confidence Threshold (Optional)**
- Only display predictions above certain threshold (e.g., 0.1 or 10%)
- Highlight top prediction with different styling
- Show "Low confidence" message if all predictions are below threshold

---

### **PHASE 8: UI/UX ENHANCEMENTS**

**8.1 CSS Styling (styles.css)**

Required styles:
- Container layout (flexbox/grid)
- Webcam/image display area
- Prediction results styling
- Button states (normal, hover, disabled)
- Loading spinner/indicator
- Responsive design for mobile
- Color scheme and typography

**8.2 Loading States**
- Show spinner during model loading
- Disable buttons until model is ready
- Show "Processing..." during prediction
- Fade-in animation for results

**8.3 Error Messages**
- Toast notifications or alert boxes
- Specific error messages for different failure types
- User-friendly language (avoid technical jargon)

---

### **PHASE 9: EVENT LISTENERS & INTERACTIVITY**

**9.1 Button Event Bindings**

```javascript
// After DOM loads:
document.getElementById('start-webcam').addEventListener('click', setupWebcam);
document.getElementById('stop-webcam').addEventListener('click', stopWebcam);
document.getElementById('image-upload').addEventListener('change', handleImageUpload);
```

**9.2 Initialization Flow**

```javascript
// On page load:
window.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize model
    // 2. Enable appropriate UI controls
    // 3. Set default mode (webcam or upload)
});
```

**9.3 State Management**
- Track current mode (webcam vs upload)
- Prevent multiple simultaneous webcam instances
- Clean up resources on mode switch
- Handle page visibility changes (pause webcam when tab inactive)

---

### **PHASE 10: OPTIMIZATION & PERFORMANCE**

**10.1 Prediction Throttling**
- Limit webcam predictions to 5-10 FPS (not every frame)
- Use `setTimeout` or frame skipping
- Balance between responsiveness and CPU usage

**10.2 Memory Management**
- Dispose of TensorFlow tensors after use
- Clear previous predictions before new ones
- Stop webcam when not needed

**10.3 Model Caching**
- Browser will cache model files automatically
- Consider Service Worker for offline support (advanced)

---

### **PHASE 11: CROSS-BROWSER COMPATIBILITY**

**11.1 Browser Support Requirements**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (check getUserMedia API)
- Mobile browsers: Test webcam access on iOS/Android

**11.2 Fallbacks**
- Check for `navigator.mediaDevices.getUserMedia` availability
- Provide image upload as fallback if webcam not available
- Display compatibility message for unsupported browsers

**11.3 HTTPS Requirement**
- Webcam requires HTTPS (or localhost)
- Vercel automatically provides HTTPS for all deployments
- All production URLs will have SSL certificates

---

### **PHASE 12: VERCEL DEPLOYMENT IMPLEMENTATION**

**12.1 Vercel CLI Installation**

Install Vercel CLI globally:
```bash
npm install -g vercel
```

**12.2 Project Initialization**

From project root directory:
```bash
vercel login
```

Login options:
- GitHub
- GitLab
- Bitbucket
- Email

**12.3 Deployment Configuration**

Run initial deployment:
```bash
vercel
```

Vercel CLI will prompt:
- Set up and deploy? [Y/n]: Y
- Which scope? (Select your account)
- Link to existing project? [y/N]: N
- What's your project's name? (enter project name)
- In which directory is your code located? ./

Configuration answers for static site:
- Want to override the settings? [y/N]: N

**12.4 Production Deployment**

Deploy to production:
```bash
vercel --prod
```

**12.5 Git Integration (Alternative Method)**

Push to GitHub/GitLab/Bitbucket:
1. Create repository on hosting platform
2. Initialize git in project:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <repository-url>
git push -u origin main
```

3. Import project in Vercel Dashboard:
   - Go to vercel.com/new
   - Select repository
   - Configure project settings (usually auto-detected)
   - Click "Deploy"

**12.6 Environment Variables (if needed)**

Add environment variables via CLI:
```bash
vercel env add MODEL_URL
```

Or in Vercel Dashboard:
- Project Settings → Environment Variables
- Add key-value pairs
- Select environments (Production, Preview, Development)

**12.7 Custom Domain Configuration**

Via Vercel Dashboard:
- Project Settings → Domains
- Add domain name
- Configure DNS records:
  - A record: 76.76.21.21
  - CNAME: cname.vercel-dns.com

Via CLI:
```bash
vercel domains add yourdomain.com
```

**12.8 Deployment URLs**

Vercel provides:
- **Production URL**: `https://your-project.vercel.app`
- **Custom Domain**: `https://yourdomain.com` (if configured)
- **Preview URLs**: Unique URL for each branch/commit

**12.9 Automatic Deployments**

With Git integration:
- Every push to main branch → Production deployment
- Every push to other branches → Preview deployment
- Every pull request → Preview deployment with unique URL

**12.10 Deployment Verification**

Check deployment status:
```bash
vercel ls
```

View deployment logs:
```bash
vercel logs <deployment-url>
```

**12.11 Vercel Project Structure Requirements**

Ensure files are in correct locations:
- `index.html` at root level
- All CSS in `/css` directory
- All JS in `/js` directory
- All static assets in `/assets` directory

**12.12 Build Configuration**

For static sites (no build step needed):
- Build Command: (leave empty)
- Output Directory: (leave empty, uses root)
- Install Command: (leave empty)

Vercel automatically serves static files from root directory.

**12.13 Redeployment**

Redeploy after changes:
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

Or push to Git repository (if using Git integration).

**12.14 Rollback Functionality**

Via Vercel Dashboard:
- Deployments tab → Select previous deployment
- Click "Promote to Production"

Via CLI:
```bash
vercel rollback <deployment-url>
```

---

### **PHASE 13: CODE ORGANIZATION & DOCUMENTATION**

**13.1 Code Structure**
```javascript
// model.js structure:
// 1. Constants and configuration
// 2. State variables
// 3. Model loading functions
// 4. Webcam functions
// 5. Image upload functions
// 6. Prediction and display functions
// 7. Utility functions
// 8. Event listeners and initialization
```

**13.2 Function Documentation**
Each function should have:
- Purpose description
- Parameter types
- Return value
- Example usage (if complex)

**13.3 Code Comments**
- Explain complex logic
- Note any browser-specific workarounds
- Document expected data structures

---

### **IMPLEMENTATION CHECKLIST**

```
☐ Create project directory structure
☐ Create vercel.json configuration file
☐ Create package.json file
☐ Create .gitignore file
☐ Create index.html with all required elements
☐ Add TensorFlow.js and Teachable Machine CDN links
☐ Create config.js with model URL and settings
☐ Create model.js file
☐ Implement initModel() function
☐ Implement error handling for model loading
☐ Implement setupWebcam() function
☐ Implement predictWebcam() loop
☐ Implement stopWebcam() function
☐ Implement handleImageUpload() function
☐ Implement predictImage() function
☐ Implement displayPredictions() function
☐ Create styles.css with all UI styling
☐ Add loading indicators
☐ Bind all event listeners
☐ Implement DOMContentLoaded initialization
☐ Add responsive design CSS
☐ Add code comments and documentation
☐ Install Vercel CLI (npm install -g vercel)
☐ Login to Vercel (vercel login)
☐ Initialize Git repository (if using Git integration)
☐ Create remote repository on GitHub/GitLab/Bitbucket (if using Git)
☐ Deploy to Vercel preview (vercel)
☐ Deploy to Vercel production (vercel --prod)
☐ Configure custom domain (optional)
☐ Verify deployment at Vercel URL
☐ Test webcam functionality on deployed site
☐ Test image upload functionality on deployed site
☐ Verify HTTPS is active (automatic with Vercel)
☐ Test on multiple browsers using production URL
☐ Test on mobile devices using production URL
```

---

### **KEY DECISION POINTS**

**A. Input Method Selection**
- **Option 1**: Webcam only
- **Option 2**: Image upload only
- **Option 3**: Both modes with toggle (RECOMMENDED)

**B. UI Layout**
- **Option 1**: Vertical layout (webcam/image top, predictions bottom)
- **Option 2**: Horizontal layout (side-by-side)
- **Option 3**: Responsive (vertical on mobile, horizontal on desktop)

**C. Prediction Display**
- **Option 1**: Show all classes
- **Option 2**: Show top 3 classes only
- **Option 3**: Show classes above confidence threshold

---

This implementation plan provides all necessary details for an AI agent to build a complete, functional webpage embedding your Teachable Machine model. The plan is deterministic with clear steps, function specifications, and implementation details.