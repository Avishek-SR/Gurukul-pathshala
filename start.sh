#!/bin/bash

# Build the frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Build the backend and move frontend to static folder
echo "Building backend..."
cd backend
mkdir -p src/main/resources/static
cp -r ../frontend/dist/* src/main/resources/static/
./mvnw clean package -DskipTests
cd ..

echo "Build complete."
