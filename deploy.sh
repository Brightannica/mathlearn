#!/bin/bash
set -e

echo "🚀 Deploying MathLearn..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "❌ Error: .env.production file not found"
  echo "Please create .env.production with your production environment variables"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

# Build the app
echo "🔨 Building the app..."
npm run build

# Start the server
echo "✅ Deployment complete!"
echo "🌐 Starting server on port $PORT..."
node server.js
