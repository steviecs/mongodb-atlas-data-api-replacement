# Use the official Node.js 20 runtime as the base image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /workspace

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm globally
RUN npm install -g pnpm@10.13.1

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build the TypeScript project
RUN pnpm run build

# Expose the port that the Functions Framework will use
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Command to run the Express server
CMD ["node", "dist/index.js"]
