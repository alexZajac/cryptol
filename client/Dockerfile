# node slim image
FROM node:12.10.0-slim
WORKDIR /usr/src/app

# installing packages
COPY ./package*.json ./
RUN npm install --quiet

# copy files
COPY . .
EXPOSE 3000

# start dev server
CMD ["npm", "start"]
