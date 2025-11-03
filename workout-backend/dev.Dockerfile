# Use an official Node.js runtime as the base image
FROM node:18.16.0

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN yarn add typescript@4.2.3
RUN yarn install

# Copy the application source code to the container
COPY . .

# Set environment variables
ENV NODE_ENV=development

# Expose the app's default ports for HTTP and HTTPS
EXPOSE 3014

# Start the app with HTTPS
CMD ["yarn", "start", "--https"]
