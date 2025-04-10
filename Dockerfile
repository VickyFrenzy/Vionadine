ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS build-env

WORKDIR /vionadine

COPY src src
COPY package*.json tsconfig.json ./

RUN npm install
RUN npm run build

###########

FROM node:${NODE_VERSION} AS deps-env

WORKDIR /vionadine

ARG NODE_ENV=production

COPY package*.json tsconfig.json ./

RUN npm install --omit=dev

###########

FROM node:${NODE_VERSION} AS run-env

WORKDIR /vionadine

COPY --from=deps-env /vionadine/node_modules node_modules
COPY --from=build-env /vionadine/dist dist
COPY package*.json tsconfig.json ./

ARG NODE_ENV=production

CMD ["node", "."]
