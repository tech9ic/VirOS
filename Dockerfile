FROM node:20-slim

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port the server will run on
EXPOSE 3000

# Start the server
CMD ["npm", "start"]