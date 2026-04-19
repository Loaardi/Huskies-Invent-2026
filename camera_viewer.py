from flask import Flask, request, jsonify, render_template_string, send_from_directory
from flask_cors import CORS
import requests
import json
import os
from security_config import get_config

app = Flask(__name__, static_folder=os.path.dirname(os.path.abspath(__file__)))
CORS(app)  # Enable CORS for all routes

#for specific file button route to roboflow
@app.route("/scan-demo-image", methods=["POST"])
def scan_demo_image():
    # Load config once per request
    config = get_config()

    if not config:
        return jsonify({"error": "Missing config"}), 500

    API_KEY = config["api_key"]
    PROJECT_ID = config["project_id"]
    VERSION = config["version"]

    # Hardcoded demo image
    image_path = "IMG_5334.JPG"

    try:
        with open(image_path, "rb") as img:
            response = requests.post(
                f"https://ROBOFLOW_URL_HERE/{PROJECT_ID}/{VERSION}" , #some kind of roboflow url here.
                params={"api_key": API_KEY},
                files={"file": img}
            )

        return jsonify(response.json())

    except FileNotFoundError:
        return jsonify({"error": "Demo image not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/inspection", methods=["POST"])
def save_inspection():
    try:
        data = request.json
        
        # Extract fields
        wo = data.get("workOrderNumber", "N/A")
        decision = data.get("operatorDecision", "N/A")
        timestamp = data.get("timestamp", "N/A")
        operator = data.get("operatorName", "N/A")
        confidence = data.get("confidence", "0%")


        # Format the string for the text file
        log_entry = f"[{timestamp}] WO: {wo} | Operator: {operator} | Result: {decision} | Confidence: {confidence}\n"

        # Append to a .txt file (creates it if it doesn't exist)
        with open("inspections.txt", "a") as f:
            f.write(log_entry)

        return jsonify({"status": "success", "message": "Data saved to file"}), 200
    
    except Exception as e:
        print(f"Error saving to file: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/", methods=["GET"])
def home():
    """Serve the main HTML file"""
    html_path = os.path.join(os.path.dirname(__file__), "UI.html")
    with open(html_path, "r") as f:
        return f.read()

@app.route("/styles.css", methods=["GET"])
def styles():
    """Serve the CSS file"""
    css_path = os.path.join(os.path.dirname(__file__), "styles.css")
    with open(css_path, "r") as f:
        return f.read(), 200, {"Content-Type": "text/css"}

@app.route("/script.js", methods=["GET"])
def script():
    """Serve the JavaScript file"""
    js_path = os.path.join(os.path.dirname(__file__), "script.js")
    with open(js_path, "r") as f:
        return f.read(), 200, {"Content-Type": "application/javascript"}

@app.route("/predict", methods=["POST"])
def predict():
    config = get_config()

    if not config:
        return jsonify({"error": "Configuration missing"}), 500

    data = request.json

    if not data or "image" not in data:
        return jsonify({"error": "No image provided"}), 400
    
    api_key = config["api_key"]

    response = requests.post(
        "PUT_ROBOFLOW_URL_HERE",
        json={
            "api_key": api_key,
            "inputs": {
                "image": {
                    "type": "base64",
                    "value": data["image"]
                }
            }
        }
    )
    result = response.json()

    # Log a warning if the annotated visualization is missing, to help with debugging
    outputs = result.get("outputs", [])
    if not outputs or not (
        outputs[0].get("predictions", {}).get("visualization") or
        outputs[0].get("visualization")
    ):
        print("⚠️  Warning: Roboflow response did not include a visualization. "
              "Check that your workflow step outputs 'visualization'.")

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)