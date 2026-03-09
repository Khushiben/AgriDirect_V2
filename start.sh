#!/bin/bash

echo "========================================"
echo "  AgriDirect - Starting Application"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/4] Checking Node.js version..."
node --version
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    echo "Please install npm"
    exit 1
fi

echo "[2/4] Checking MongoDB..."
echo "Note: Make sure MongoDB is running on your system"
echo "If using MongoDB Atlas, you can skip this step"
echo ""

# Start the backend server
echo "[3/4] Starting Backend Server..."
cd server
gnome-terminal --title="AgriDirect Backend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -title "AgriDirect Backend" -e "npm run dev; bash" 2>/dev/null || \
konsole --title "AgriDirect Backend" -e "npm run dev; bash" 2>/dev/null || \
(npm run dev &)
cd ..
echo "Backend server starting on http://localhost:5000"
echo ""

# Wait a bit for backend to start
sleep 3

# Start the frontend client
echo "[4/4] Starting Frontend Client..."
cd client
gnome-terminal --title="AgriDirect Frontend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -title "AgriDirect Frontend" -e "npm run dev; bash" 2>/dev/null || \
konsole --title "AgriDirect Frontend" -e "npm run dev; bash" 2>/dev/null || \
(npm run dev &)
cd ..
echo "Frontend client starting on http://localhost:5173"
echo ""

echo "========================================"
echo "  Application Started Successfully!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Opening browser in 3 seconds..."
sleep 3

# Open browser (try different commands based on OS)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
elif command -v gnome-open &> /dev/null; then
    gnome-open http://localhost:5173
elif command -v open &> /dev/null; then
    open http://localhost:5173
else
    echo "Please open http://localhost:5173 in your browser"
fi

echo ""
echo "To stop the application:"
echo "1. Close both terminal windows"
echo "2. Or press Ctrl+C in each window"
echo "3. Or run: pkill -f 'npm run dev'"
echo ""
