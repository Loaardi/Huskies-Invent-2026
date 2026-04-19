// GLOBAL: holds the timestamp of the most recent snapshot
let currentTimestamp = null;
let workOrderNumber = "UNKNOWN";

// LOGGING
function logAction(action) {
  const log = document.getElementById("log");
  const time = new Date().toLocaleTimeString();
  const entry = document.createElement("li");
  entry.textContent = `${action} at ${time}`;
  log.prepend(entry);
}

// COLOR MASKING — keeps only bronze/copper-toned pixels, blacks out the rest
// Bronze is characterized by: high Red, medium-high Green, low Blue, and R > G > B
function applyBronzeMask(canvas) {
  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data; // RGBA array

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // Convert to HSV to make color range detection more robust
    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let h = 0;
    if (delta > 0) {
      if (max === rNorm)      h = 60 * (((gNorm - bNorm) / delta) % 6);
      else if (max === gNorm) h = 60 * (((bNorm - rNorm) / delta) + 2);
      else                    h = 60 * (((rNorm - gNorm) / delta) + 4);
    }
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : delta / max;  // Saturation 0–1
    const v = max;                           // Value/brightness 0–1

    // Bronze/copper HSV range:
    //   Hue: 15–45° (orange-yellow-brown)
    //   Saturation: > 20% (not grey/white)
    //   Value: > 15% (not black)
    const isBronze = (h >= 10 && h <= 55) && (s >= 0.20) && (v >= 0.15);

    if (!isBronze) {
      // Black out non-bronze pixels
      pixels[i]     = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
      // Keep alpha as-is
    }
  }

  context.putImageData(imageData, 0, 0);
}

// SNAPSHOT — captures frame, applies bronze mask, sends to Roboflow, draws annotated result
function snapshot() {
  const canvas = document.querySelector("#canvas");
  const context = canvas.getContext("2d");

  currentTimestamp = Date.now();

  // Apply bronze color mask to isolate the plate
  //applyBronzeMask(canvas);
  //logAction("Bronze mask applied");

  // Get masked image as base64
  const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];

  logAction("Sending image to Roboflow for analysis...");

  fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image })
  })
    .then(res => res.json())
    .then(data => {
      const output = data?.outputs?.[0];

      // Annotated image is in detection_visualization_output.image.value
      const annotatedBase64 = output?.detection_visualization_output?.image?.value || null;

      if (annotatedBase64) {
        const img = new Image();
        img.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          logAction("Annotated result displayed");
        };
        img.src = "data:image/jpeg;base64," + annotatedBase64;

        // Update confidence from first prediction (if any)
        const firstPrediction = output?.predictions?.predictions?.[0];
        if (firstPrediction?.confidence != null) {
          updateConfidence(Math.round(firstPrediction.confidence * 100));
        } else {
          updateConfidence(0);
        }

        // Log defect count
        const count = output?.count_objects;
        if (count != null) {
          logAction(`Defects detected: ${count}`);
        }

      } else {
        logAction("⚠️ No annotated image returned");
        console.warn("Full response:", data);
      }
    })
    .catch(err => {
      logAction("❌ Error contacting Roboflow");
      console.error(err);
    });
}

document.getElementById("acceptBtn").onclick = () => sendDecision("Pass");
document.getElementById("rejectBtn").onclick = () => sendDecision("Fail");

  

let operatorName = "Unknown";

document.getElementById("saveOperator").onclick = function() {
  const nameInput = document.getElementById("operatorName").value;
  const workInput = document.getElementById("workOrder").value;

  if (nameInput.trim() !== "" && workInput.trim() !== "") {
      operatorName = nameInput;
      workOrderNumber = workInput;

      logAction(`Operator: ${operatorName}, WO: ${workOrderNumber}`);

      this.textContent = "Saved!";
      this.style.background = "#2ecc71";

      setTimeout(() => {
          this.textContent = "Save";
          this.style.background = "#30475e";
      }, 2000);
  } else {
      logAction("Enter name AND work order");
  }
};

function sendInspection(data) {
  return fetch("/api/inspection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

function sendDecision(decision) {
  if (operatorName === "Unknown" || workOrderNumber === "UNKNOWN") {
    logAction("Set operator and work order first");
    return;
  }
  if (!currentTimestamp) {
    logAction("No image to evaluate");
    return;
  }

  const data = {
    workOrderNumber: workOrderNumber,
    operatorName: operatorName,
    operatorDecision: decision,
    timestamp: new Date().toISOString(),
    confidence: document.getElementById("confidenceValue").textContent
  };

  logAction(`[Op: ${operatorName}] WO: ${workOrderNumber} → ${decision}`);

  sendInspection(data)
    /*.then(() => logAction("Saved to backend"))
    .catch(() => logAction("Error saving")); */
}

function loadLog() {}
loadLog();

function updateConfidence(value) {
  document.getElementById("confidenceValue").textContent = value + "%";
}

