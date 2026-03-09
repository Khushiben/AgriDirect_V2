#!/bin/bash

echo "========================================"
echo "  AgriDirect - Installing Dependencies"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    echo "Please install npm"
    exit 1
fi

echo "[1/3] Installing Backend Dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies!"
    cd ..
    exit 1
fi
cd ..
echo "Backend dependencies installed successfully!"
echo ""

echo "[2/3] Installing Frontend Dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies!"
    cd ..
    exit 1
fi
cd ..
echo "Frontend dependencies installed successfully!"
echo ""

echo "[3/3] Setup Complete!"
echo ""
echo "========================================"
echo "  Installation Completed Successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Configure server/.env file with your settings"
echo "3. Run ./start.sh to start the application"
echo ""
