#!/bin/bash

# Mihaela Fitness - Deployment Script
# Dit script prepareert de applicatie voor deployment

echo "🚀 Mihaela Fitness Deployment Script"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Stop any running development servers
echo "🛑 Stopping development servers..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate --no-engine

# Build the application
echo "🏗️  Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Deployment ready!"
    echo ""
    echo "📋 Next steps:"
    echo "1. For Vercel: Push to GitHub and connect to Vercel"
    echo "2. For Netlify: Push to GitHub and connect to Netlify"
    echo "3. For manual deployment: Upload .next folder to your server"
    echo ""
    echo "🌐 Environment variables needed in production:"
    echo "- DATABASE_URL"
    echo "- BLOB_READ_WRITE_TOKEN"
    echo "- JWT_SECRET"
    echo "- NEXTAUTH_SECRET"
    echo ""
    echo "📁 Build output: .next/"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
