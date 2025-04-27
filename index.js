document.getElementById("openPopUp").addEventListener("click", () => {
    if (!pipWindow) {
        openDocumentPiP();
    } else {
        onLeavePiP.bind(pipWindow)();
    }
});

async function openDocumentPiP(windowSize = { width: 400, height: 300 }) {
    try {
      // Check if Document Picture-in-Picture API is available
      if (!("documentPictureInPicture" in window)) {
        console.error("Document Picture-in-Picture is not supported in this browser");
        alert("Document Picture-in-Picture is not supported in this browser");
        return;
      }
  
      // Get the current page's title
      const pageTitle = document.title;
  
      // Open a Picture-in-Picture window with fixed dimensions and no resize
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: windowSize.width,
        height: windowSize.height,
        initialAspectRatio: windowSize.width / windowSize.height,
        lockAspectRatio: true,
        preferInitialWindowPlacement: true,
      });
  
      // Set up the basic structure of the PiP window document
      pipWindow.document.head.innerHTML = `
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            width: 100vw;
            height: 100vh;
          }
          .header {
            background-color: #4285f4;
            color: white;
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            user-select: none;
          }
          .content {
            flex-grow: 1;
            position: relative;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
          .controls {
            display: flex;
            gap: 8px;
          }
          button {
            padding: 4px 8px;
            border: none;
            border-radius: 4px;
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            cursor: pointer;
          }
          button:hover {
            background-color: rgba(255, 255, 255, 0.3);
          }
          .non-resizable-notice {
            position: absolute;
            bottom: 0;
            right: 0;
            background-color: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 4px 8px;
            font-size: 12px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
          }
          body:hover .non-resizable-notice {
            opacity: 1;
          }
        </style>
      `;
  
      pipWindow.document.body.innerHTML = `
        <div class="header">
          <div class="title">${pageTitle}</div>
          <div class="controls">
            <button id="refreshBtn">Refresh</button>
            <button id="zoomInBtn">Zoom +</button>
            <button id="zoomOutBtn">Zoom -</button>
            <button id="resetZoomBtn">Reset Zoom</button>
            <button id="resizeButton">Resize</button>
          </div>
        </div>
        <div class="content">
          <div id="loading">Loading content...</div>
        </div>
        <div class="non-resizable-notice">Fixed size window (${windowSize.width}×${windowSize.height})</div>
      `;
  
      // Get the content area where we'll place our content
      const contentArea = pipWindow.document.querySelector(".content");
  
      // Set CSS to prevent resize attempts
      pipWindow.document.documentElement.style.width = `${windowSize.width}px`;
      pipWindow.document.documentElement.style.height = `${windowSize.height}px`;
      pipWindow.document.documentElement.style.overflow = "hidden";
  
      // Override any resize attempts
      const preventResize = () => {
        console.log("resize to");
        pipWindow.resizeTo(windowSize.width, windowSize.height);
      };
  
      // Add resize prevention
      pipWindow.addEventListener("resize", preventResize);
  
      // Clone the current page content
      const cloneContent = async () => {
        try {
          // Use iframe to show the same page
          const iframe = pipWindow.document.createElement("iframe");
          iframe.src = window.location.href;
  
          // Remove the loading indicator once iframe loads
          iframe.onload = () => {
            const loadingElement = pipWindow.document.getElementById("loading");
            if (loadingElement) {
              loadingElement.remove();
            }
          };
  
          contentArea.appendChild(iframe);
  
          // Setup buttons functionality
          const refreshBtn = pipWindow.document.getElementById("refreshBtn");
          const zoomInBtn = pipWindow.document.getElementById("zoomInBtn");
          const zoomOutBtn = pipWindow.document.getElementById("zoomOutBtn");
          const resetZoomBtn = pipWindow.document.getElementById("resetZoomBtn");
          const resizeButton = pipWindow.document.getElementById("resizeButton");
  
          // Track zoom level
          let zoomLevel = 1.0;
  
          // Refresh button
          refreshBtn.addEventListener("click", () => {
            iframe.src = iframe.src;
          });
  
          // Zoom control functions
          zoomInBtn.addEventListener("click", () => {
            zoomLevel += 0.1;
            iframe.style.transform = `scale(${zoomLevel})`;
            iframe.style.transformOrigin = "top left";
          });
  
          zoomOutBtn.addEventListener("click", () => {
            zoomLevel = Math.max(0.5, zoomLevel - 0.1);
            iframe.style.transform = `scale(${zoomLevel})`;
            iframe.style.transformOrigin = "top left";
          });
  
          resetZoomBtn.addEventListener("click", () => {
            zoomLevel = 1.0;
            iframe.style.transform = "scale(1)";
          });
  
          resizeButton.addEventListener("click", () => {
            pipWindow.resizeTo(windowSize.width, windowSize.height);
          });
        } catch (error) {
          console.error("Error cloning content:", error);
          contentArea.innerHTML = `<p>Error loading content: ${error.message}</p>`;
        }
      };
  
      await cloneContent();
  
      // Make sure window stays at the fixed size
    } catch (error) {
      console.error("Error creating Picture-in-Picture window:", error);
      alert(`Error creating Picture-in-Picture window: ${error.message}`);
    }
  };