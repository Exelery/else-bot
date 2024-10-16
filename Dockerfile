# Use the official Bun image as a parent image
FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN bun install

# Copy the rest of your app's source code
COPY . .

# Expose the port your app runs on (if applicable)
# EXPOSE 3000

# Run the application
CMD ["bun", "start"]