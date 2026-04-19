from flask import Flask, request, jsonify, render_template_string, send_from_directory
from flask_cors import CORS
import requests
import os
from security_config import get_config

app = Flask(__name__, static_folder=os.path.dirname(os.path.abspath(__file__)))
CORS(app)  # Enable CORS for all routes

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
    api_key = config["api_key"]

    response = requests.post(
        "https://serverless.roboflow.com/feavens-workspace/workflows/detect-count-and-visualize",
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
