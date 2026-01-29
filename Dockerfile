ARG NODE_VERSION=22-alpine

FROM --platform=$BUILDPLATFORM node:${NODE_VERSION}

RUN apk add ffmpeg

WORKDIR /another-discord-bot

COPY package.json index.js ./
COPY commands commands
COPY util util

ARG NODE_ENV=production

RUN npm install --omit=dev

CMD ["node", "."]
