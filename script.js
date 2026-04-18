// GLOBAL: holds the timestamp of the most recent snapshot
let currentTimestamp = null;

// LOGGING

function logAction(action) {
  const log = document.getElementById("log");
  const time = new Date().toLocaleTimeString();

  const entry = document.createElement("li");
  entry.textContent = `${action} at ${time}`;

  log.prepend(entry);
}

// SNAPSHOT (placeholder backend)
function snapshot() {
  const canvas = document.querySelector("#canvas");

  currentTimestamp = Date.now();
}

  document.getElementById("acceptBtn").onclick = () => sendDecision("Good");
document.getElementById("rejectBtn").onclick = () => sendDecision("Defect");

  
// ACCEPT / REJECT (placeholder)

function sendDecision(decision) {
  if (!currentTimestamp) {
    logAction("No image to evaluate");
    return;
  }

 
  logAction(`Operator marked image as: ${decision.toUpperCase()}`);
}



function loadLog() {}

loadLog();
