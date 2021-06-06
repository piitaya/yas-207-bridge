# First stage, build dist folder with nest and prisma cli
FROM node:alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python3 && \
    npm install --quiet node-gyp -g

RUN npm install

COPY . .

RUN npm run build

# Second stage (to reduce the final image size), pass a clean dist folder
FROM node:alpine

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package*.json ./

RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python3 && \
    npm install --quiet node-gyp -g

RUN npm ci --production && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

ENV PORT 9207
EXPOSE $PORT

CMD ["node", "dist/index"]