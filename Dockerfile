FROM node:22-alpine

WORKDIR /app
COPY package*.json ./

RUN npm ci && \
    chmod -R +x node_modules/.bin && \
    chmod -R 755 node_modules/@prisma

    
COPY . .

RUN npx prisma generate && npm prune --omit=dev
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "run", "start"]
