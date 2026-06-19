FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
