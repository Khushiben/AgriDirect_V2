#!/bin/bash

echo "========================================"
echo "  AgriDirect - Stopping Application"
echo "========================================"
echo ""

echo "Stopping all npm dev processes..."
pkill -f "npm run dev"

echo ""
echo "Application stopped successfully!"
echo ""
