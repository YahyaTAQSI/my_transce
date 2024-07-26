# Stage 1: Build the application
FROM node:20

RUN apt-get update && apt-get install -y postgresql-client

# # Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json ./

COPY . .

# Install dependencies
RUN npm install

# Insert into tables some data [items ]
ENTRYPOINT [ "sh", "script.sh" ]
# ENTRYPOINT [ "tail", "-f"]