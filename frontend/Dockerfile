# Stage 1: Build the application
FROM node:20

# # Set the working directory
WORKDIR /frontend

# Copy the package.json and package-lock.json files
COPY package.json .

COPY . .

# Install dependencies
RUN npm install

RUN npm run build

CMD [ "npm", "run", "start", "--", "-p", "5252"]
# CMD [ "npm", "run", "dev", "--", "-p", "5252"]