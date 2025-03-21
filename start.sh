#!/bin/bash

# Start script for running both backend and frontend of the License Management System
echo "=== Starting License Management System ==="

# Check if the terminal supports color
if [ -t 1 ]; then
  BLUE="\033[1;34m"
  GREEN="\033[1;32m"
  RED="\033[1;31m"
  YELLOW="\033[1;33m"
  RESET="\033[0m"
else
  BLUE=""
  GREEN=""
  RED=""
  YELLOW=""
  RESET=""
fi

echo -e "${BLUE}This script will start both the backend and frontend services.${RESET}"
echo

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${RESET}"

if ! command_exists python; then
  echo -e "${RED}Error: Python is not installed. Please install Python 3.8 or higher.${RESET}"
  exit 1
fi

if ! command_exists node; then
  echo -e "${RED}Error: Node.js is not installed. Please install Node.js 16 or higher.${RESET}"
  exit 1
fi

if ! command_exists npm; then
  echo -e "${RED}Error: npm is not installed. Please install npm.${RESET}"
  exit 1
fi

# Start backend in a new terminal window
echo -e "${YELLOW}Starting backend server...${RESET}"
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/backend && source ../venv/bin/activate && uvicorn app.main:app --reload"'
else
  # Linux or other Unix-like systems
  gnome-terminal -- bash -c "cd $(pwd)/backend && source ../venv/bin/activate && uvicorn app.main:app --reload; exec bash" || \
  xterm -e "cd $(pwd)/backend && source ../venv/bin/activate && uvicorn app.main:app --reload; exec bash" || \
  konsole -e "cd $(pwd)/backend && source ../venv/bin/activate && uvicorn app.main:app --reload; exec bash"
fi

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${RESET}"
MAX_RETRIES=10
RETRY_COUNT=0
BACKEND_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s http://localhost:8000/api/v1/deployments/statistics > /dev/null; then
    BACKEND_READY=true
    break
  fi
  echo "Waiting for backend... ($((RETRY_COUNT+1))/$MAX_RETRIES)"
  sleep 2
  RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ "$BACKEND_READY" = true ]; then
  echo -e "${GREEN}Backend started successfully!${RESET}"
else
  echo -e "${RED}Backend did not start in the expected time. Starting frontend anyway...${RESET}"
fi

# Start frontend
echo -e "${YELLOW}Starting frontend...${RESET}"
cd frontend

# Check if node_modules exists or if it is incomplete
if [ ! -d "node_modules" ] || [ ! -d "node_modules/react" ]; then
  echo -e "${YELLOW}Installing frontend dependencies...${RESET}"
  # Remove potentially broken node_modules
  if [ -d "node_modules" ]; then
    echo -e "${YELLOW}Removing incomplete node_modules...${RESET}"
    rm -rf node_modules
  fi
  
  # Install dependencies
  echo -e "${YELLOW}Running npm install...${RESET}"
  npm install
  
  # Check if installation succeeded
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies. Please try running 'npm install' manually in the frontend directory.${RESET}"
    exit 1
  fi
fi

echo -e "${GREEN}Starting frontend development server...${RESET}"
echo -e "${GREEN}The application will be available at http://localhost:3000${RESET}"
npm start
