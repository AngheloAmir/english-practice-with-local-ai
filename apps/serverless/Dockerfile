# Use the official Node.js image.
FROM node:24-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install production dependencies.
# If you add a package-lock.json, speed your build by switching to 'npm ci'.
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Compile TS (if you are running build inside docker)
# RUN npm install typescript tsup
# RUN npm run build

# Run the web service on container startup.
CMD [ "npm", "start" ]
