# 1. الدخول مجدداً إلى مجلد الواجهة الأمامية
cd client

# 2. بناء ملفات مشروع React (سيقوم بإنشاء مجلد dist)
npm run build

# 3. استبدال Dockerfile ليكون خفيفاً ومخصصاً للتشغيل فقط (Nginx)
cat << 'EOF' > Dockerfile
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# 4. العودة للمسار الرئيسي للمشروع
cd ..

# 5. بناء وتشغيل بيئة دوكر بالكامل
docker-compose up --build
