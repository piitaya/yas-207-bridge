# First stage, build dist folder with nest and prisma cli
FROM node:15.11.0-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk --no-cache add \
    coreutils \	
    jq \
    linux-headers \
    alpine-sdk \	
    python

RUN npm install

COPY . .

RUN npm run build && npm remove $(cat package.json | jq -r '.devDependencies | keys | join(" ")')

# Second stage (to reduce the final image size), pass a clean dist folder
FROM node:15.11.0-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN apk add --no-cache \	
    libstdc++ \
    openssl \
    libgcc \	
    libusb \	
    tzdata \	
    eudev	

COPY --from=builder /usr/src/app /usr/src/app

WORKDIR /usr/src/app

EXPOSE 9207

CMD ["node", "dist/index"]