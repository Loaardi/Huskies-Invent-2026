import os
from dotenv import load_dotenv

def get_config():
    """Loads and validates project configuration."""
    load_dotenv()

    config = {
        "api_key": os.getenv("ROBOFLOW_API_KEY"),
        "project_id": os.getenv("PROJECT_ID"),
        "version": os.getenv("MODEL_VERSION")
    }

    # Check if anything is missing
    for key, value in config.items():
        if not value:
            print(f"❌ SECURITY ALERT: {key} is missing in your local .env file!")
            return None

    return config
