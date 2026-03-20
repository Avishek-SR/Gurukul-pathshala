#!/bin/bash
echo "🚀 Starting Automated Deployment..."

# Navigate to the root directory of the project
# Assuming deploy.sh is located in deploy/oracle/
cd "$(dirname "$0")/../../" || exit 1

# Pull the latest changes from the main branch
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Build the Frontend
echo "📦 Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# Build the Backend
echo "🏗️ Building Backend..."
cd backend
chmod +x mvnw
./mvnw clean package -DskipTests
cd ..

# ---------- SERVICE RESTART ----------
# Depending on how you run your app on Oracle Cloud, uncomment the appropriate line below:

# Ensure Docker Compose containers are updated:
# docker-compose up -d --build

echo "✅ Deployment completed!"
