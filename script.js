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

// SNAPSHOT
function snapshot() {
  const canvas = document.querySelector("#canvas");

  currentTimestamp = Date.now();
}

  document.getElementById("acceptBtn").onclick = () => sendDecision("Pass");
document.getElementById("rejectBtn").onclick = () => sendDecision("Fail");

  
 function sendDecision(decision) {
  if (!currentTimestamp) {
    logAction("No image to evaluate");
    return;
  }
 
  logAction(`Operator marked image as: ${decision.toUpperCase()}`);
}


function loadLog() {}

loadLog();

function updateConfidence(value) {
  // data goes here

  document.getElementById("confidenceValue").textContent = value + "%";
}

//shell call
function sendInspection(data) {
  console.log("Sending to backend:", data);

  return fetch("/api/inspection", {
    method: "POST",
    headers: {"Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}