"""
Test script for order creation with proper response validation
"""
import requests
import json
from pprint import pprint

BASE_URL = "http://localhost:8000/api/v1"

# Login credentials for a partner account
credentials = {
    "username": "partner1",
    "password": "partner123"
}

def test_order_creation():
    # Step 1: Login to get access token
    login_url = f"{BASE_URL}/partners/login"
    # OAuth2 expects form data, not JSON
    login_response = requests.post(login_url, data=credentials)
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.text}")
        return
        
    token_data = login_response.json()
    access_token = token_data["access_token"]
    print(f"Login successful. Token: {access_token[:10]}...")
    
    # Set auth headers
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Step 2: Create an order
    orders_url = f"{BASE_URL}/partners/orders"
    
    order_data = {
        "OrderNumber": "ORD-TEST-001",  
        "OrderDate": "2025-03-25",
        "TotalAmount": 5000.0,
        "Status": "DRAFT",
        "Notes": "Test order creation",
        "AgreementAcknowledged": True,
        "OrderItems": [
            {
                "ProductName": "Dify Enterprise License",
                "Quantity": 1,
                "UnitPrice": 5000.0,
                "TotalPrice": 5000.0,
                "EndUserName": "Test Company Ltd."
            }
        ]
    }
    
    create_response = requests.post(orders_url, json=order_data, headers=headers)
    
    print(f"Order creation status code: {create_response.status_code}")
    
    if create_response.status_code == 200:
        print("Order created successfully!")
        order_data = create_response.json()
        print("Order data:")
        pprint(order_data)
    else:
        print(f"Order creation failed: {create_response.text}")
    
    # Step 3: Get all orders for this partner
    orders_list_url = f"{BASE_URL}/partners/orders"
    orders_response = requests.get(orders_list_url, headers=headers)
    
    if orders_response.status_code == 200:
        print("\nPartner orders retrieved successfully!")
        orders = orders_response.json()
        print(f"Total orders: {len(orders)}")
        if orders:
            print("Latest order:")
            pprint(orders[0])
    else:
        print(f"Failed to get orders: {orders_response.text}")

if __name__ == "__main__":
    test_order_creation()
