#!/bin/bash

# Build the Angular application for production
echo "Building Angular application..."
# ng build --configuration=production
ng build
# Set Firebase project
echo "Building Angular application..."
firebase use reporte-ciudadano-boca-del-rio

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "Deployment  reporte-ciudadano-boca-del-rio completed! "