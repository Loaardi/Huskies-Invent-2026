// GLOBAL: holds the timestamp of the most recent snapshot
let currentTimestamp = null;

// LOGGING

function logAction(action) {
  const log = document.getElementById("log");
  const time = new Date().toLocaleTimeString();

  const entry = document.createElement("li");
  entry.textContent = `${time} - ${action}`;

  log.prepend(entry);
}

// SNAPSHOT (placeholder backend)
function snapshot() {
  const canvas = document.querySelector("#canvas");

  // TEMPORARY FRONTEND PLACEHOLDER:
  currentTimestamp = Date.now(); // fake timestamp
  document.getElementById("liveVideo").src =
    "https://via.placeholder.com/300?text=Live+Feed+" + Math.random();

  document.getElementById("defectImg").src =
    "https://via.placeholder.com/300/ff0000?text=Annotated+" + Math.random();

  logAction("Snapshot taken (placeholder)");
}
  
// ACCEPT / REJECT (placeholder)

function sendDecision(decision) {
  if (!currentTimestamp) {
    logAction("No image to evaluate");
    return;
  }

  // Placeholder backend call:
 
  logAction(`Operator marked image as: ${decision.toUpperCase()}`);
}

document.getElementById("acceptBtn").onclick = () => sendDecision("accept");
document.getElementById("rejectBtn").onclick = () => sendDecision("reject");


// LOAD LOG (placeholder backend)
function loadLog() {

}

loadLog();
