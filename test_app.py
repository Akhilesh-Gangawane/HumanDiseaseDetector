import requests
import json

def test_inference():
    # Example mock symptoms
    symptoms = {
        "itching": 1,
        "skin_rash": 1,
        "nodal_skin_eruptions": 1,
        "continuous_sneezing": 0
    }
    
    url = "http://localhost:8000/predict"
    payload = {"symptoms": symptoms}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if response.status_code == 200:
            print("Prediction Response:", response.json())
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print("Failed to connect to API:", e)

if __name__ == "__main__":
    test_inference()
