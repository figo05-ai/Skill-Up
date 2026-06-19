#!/usr/bin/bash
# 1. إنشاء ملف Dockerfile الخاص بالـ Backend
cat << 'EOF' > Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
EOF

# 2. إنشاء ملف Dockerfile الخاص بالـ Frontend (داخل مجلد client)
cat << 'EOF' > client/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# 3. إنشاء ملف docker-compose.yml في المسار الرئيسي
cat << 'EOF' > docker-compose.yml
version: '3.8'

services:
  database:
    image: mysql:8.0
    container_name: skillup_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: skillup_db
      MYSQL_USER: devuser
      MYSQL_PASSWORD: devpassword
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: skillup_backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=database
      - DB_USER=devuser
      - DB_PASSWORD=devpassword
      - DB_NAME=skillup_db
      - PORT=5000
    depends_on:
      - database

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: skillup_frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  db_data:
EOF
