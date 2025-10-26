# Stage 1: Base
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# # Stage 3: Production
# FROM base AS prod
# RUN npm ci --omit=dev
# COPY . .
# RUN npm run build
# EXPOSE 3000
# CMD ["npm", "run", "start:prod"]
