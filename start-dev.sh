#!/bin/bash

echo "🚀 Starting Chiryani POS Development Server..."
echo "🖨️  Thermal Printer Support: Bluetooth, USB & Serial"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found!"
    echo "   Please copy .env.local.example to .env.local and configure it"
    echo "   cp .env.local.example .env.local"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Start development server
echo "🔥 Starting development server on http://localhost:3000"
echo ""
echo "🖨️  THERMAL PRINTER FEATURES:"
echo "   - Connect via Bluetooth, USB, or Serial"
echo "   - Supports EPSON, Star Micronics, Citizen, Bixolon"
echo "   - Auto-print receipts with professional formatting"
echo "   - Cash drawer integration"
echo "   - Configurable print settings"
echo ""

pnpm dev
