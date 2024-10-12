# Specify a base image
FROM node:20-alpine

# Set working directory in the container (Created bu Docker if it doesn't exist)
WORKDIR /app

# Copy package.json to the working directory
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

#Expose the port the app runs on
EXPOSE 3000

# Create a non-login user and group (without home directory)
RUN adduser -D -H appuser

# Switch to the non-login user
USER appuser

# Command to run the application
CMD ["node","app.js"]