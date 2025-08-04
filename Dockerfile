# Development stage
FROM node:20-alpine

# Install build dependencies
# RUN apk add --no-cache python3 make g++

# Install global dependencies
RUN npm install -g ts-node typescript

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=development
EXPOSE 3000

# Default command (can be overridden by docker-compose)
CMD ["npm", "run", "dev"]
