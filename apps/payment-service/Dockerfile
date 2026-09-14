FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm run build
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4004
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:4004/health || exit 1
CMD ["node","dist/index.js"]
