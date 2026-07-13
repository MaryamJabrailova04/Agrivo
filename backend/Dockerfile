FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci \
  && npx prisma generate \
  && npm prune --omit=dev \
  && rm -rf /root/.npm /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx

COPY backend/src ./src
COPY backend/nodemon.json ./nodemon.json

RUN chown -R 10001:10001 /app

USER 10001:10001

EXPOSE 5000

CMD ["node", "src/server.js"]
