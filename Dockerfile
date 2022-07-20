FROM nginx:alpine
RUN mkdir /app
COPY build /app/build
COPY nginx.conf /etc/nginx/conf.d/nginx.conf
