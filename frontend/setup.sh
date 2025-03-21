#!/bin/bash

# Setup script for the License Management System frontend

echo "=== License Management System Frontend Setup ==="
echo "This script will install dependencies and prepare the development environment."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js before continuing."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ $NODE_MAJOR -lt 16 ]; then
    echo "Warning: Node.js version $NODE_VERSION detected. We recommend using Node.js 16 or higher."
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if backend is running
echo "Checking if backend is running..."
if curl -s http://localhost:8000/api/v1/deployments/statistics &> /dev/null; then
    echo "Backend is running!"
else
    echo "Warning: Backend does not seem to be running at http://localhost:8000."
    echo "Make sure to start the backend server before using the frontend."
fi

echo "=== Setup Complete ==="
echo "To start the development server, run: npm start"
echo "The frontend will be available at http://localhost:3000"
