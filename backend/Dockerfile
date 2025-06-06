# Use the official Node.js 18 image
FROM node:18

# Create app directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the backend source code
COPY . .

# Expose the backend port
EXPOSE 8080

# Start the backend server in dev mode (you can change this to 'start' for production)
CMD ["npm", "start"]

