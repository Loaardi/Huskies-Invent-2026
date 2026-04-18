from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from security_config import get_config
 
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
 
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
 
    return jsonify(response.json())
 
if __name__ == "__main__":
    app.run(debug=True)