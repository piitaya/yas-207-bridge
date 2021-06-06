# First stage, build dist folder with nest and prisma cli
FROM node as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=development

COPY . .

RUN npm run build

# Second stage (to reduce the final image size), pass a clean dist folder
FROM node

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package*.json ./

RUN npm ci --production && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

ENV PORT 9207
EXPOSE $PORT

CMD ["node", "dist/index"]