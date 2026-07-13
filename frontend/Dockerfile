FROM node:20-bookworm-slim AS build

WORKDIR /app

ARG VITE_API_URL=/api
ARG VITE_DATA_MODE=api

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DATA_MODE=$VITE_DATA_MODE

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/index.html ./index.html
COPY frontend/vite.config.ts ./vite.config.ts
COPY frontend/postcss.config.mjs ./postcss.config.mjs
COPY frontend/src ./src

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
