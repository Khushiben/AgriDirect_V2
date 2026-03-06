#!/bin/bash

# AgriDirect V2 Startup Script
echo "🌱 Starting AgriDirect V2..."

# Set up trap to catch Ctrl+C and kill all background processes
trap 'echo -e "\n🛑 Stopping all processes..."; kill $(jobs -p) 2>/dev/null; exit 0' INT

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Kill processes on ports 5000 and 5173
echo "🔄 Killing existing processes on ports 5000 and 5173..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be freed
sleep 2

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install

# Seed demo accounts (idempotent upsert)
echo "🌱 Seeding demo accounts..."
npm run seed 2>/dev/null || true

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client && npm install --legacy-peer-deps

# Start the application
echo "🚀 Starting AgriDirect V2..."
echo "🔧 Starting server on port 5000..."
cd ../server && npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo "🎨 Starting client on port 5173..."
cd ../client && npm run dev &
CLIENT_PID=$!

# Wait for client to start
sleep 3

echo "✅ AgriDirect V2 is running!"
echo "🌐 Client: http://localhost:5173"
echo "🔧 Server: http://localhost:5000"
echo ""
echo "👤 Demo Accounts (run 'cd server && npm run seed' if not yet created):"
echo "   Farmer: farmer@demo.com / demo123"
echo "   Consumer: consumer@demo.com / demo123"
echo "   Distributor: distributor@demo.com / demo123"
echo "   Retailer: retailer@demo.com / demo123"
echo "   Admin: admin@demo.com / demo123"
echo ""
echo "⚠️  Press Ctrl+C to stop all services"

# Wait for background processes or Ctrl+C
wait
