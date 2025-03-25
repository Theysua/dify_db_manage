"""
Script to test order creation with the updated models and schemas.
Run this script from the backend directory:
    python -m app.db.test_order_creation
"""

import sys
import os
from pathlib import Path

# Add the parent directory to sys.path to ensure imports work correctly
sys.path.append(str(Path(__file__).parent.parent.parent))

import requests
import json

# Partner login credentials
partner_credentials = {
    "Username": "partner1",
    "Password": "password123"
}

# Base URL for the API
base_url = "http://localhost:8000/api/v1"

def test_order_creation():
    # Step 1: Login to get the partner token
    login_url = f"{base_url}/partners/login"
    login_response = requests.post(login_url, json=partner_credentials)
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.status_code}")
        print(login_response.text)
        return
    
    token_data = login_response.json()
    access_token = token_data["access_token"]
    print(f"Login successful. Token: {access_token[:10]}...")
    
    # Step 2: Create an order
    order_url = f"{base_url}/partners/orders"
    
    # Order data with updated schema
    order_data = {
        "AgreementAcknowledged": True,
        "OrderItems": [
            {
                "ProductName": "Dify Enterprise",
                "Quantity": 1,
                "Unit": "license",
                "UnitPrice": 10000.0,
                "TotalPrice": 10000.0,
                "EndUserName": "Test End User"
            }
        ],
        "Notes": "Test order created via API"
    }
    
    # Set the Authorization header with the token
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Send the order creation request
    order_response = requests.post(order_url, json=order_data, headers=headers)
    
    if order_response.status_code == 200:
        print("Order created successfully!")
        print(json.dumps(order_response.json(), indent=2))
    else:
        print(f"Order creation failed: {order_response.status_code}")
        print(order_response.text)

if __name__ == "__main__":
    test_order_creation()
