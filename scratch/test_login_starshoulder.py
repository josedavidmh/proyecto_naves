from app import create_app
import traceback

app = create_app()
client = app.test_client()

try:
    res = client.post("/api/auth/login", json={
        "identifier": "StarShoulder",
        "password": "Password123!"
    })
    print("Status:", res.status_code)
    print("Response JSON:", res.get_json())
except Exception as e:
    traceback.print_exc()
