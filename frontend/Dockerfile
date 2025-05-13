# Этап сборки (build stage)
FROM node:22-alpine as build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Создаем production build
RUN npm run build

# Этап для продакшн (production stage)
FROM nginx:alpine

# Копируем статические файлы из этапа сборки
COPY --from=build /app/build /var/www/html

# Копируем кастомную конфигурацию Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"] 