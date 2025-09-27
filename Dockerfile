FROM node:24.9.0-alpine3.21 AS base

RUN mkdir /usr/src/app -p

WORKDIR /usr/src/app

COPY . .

RUN corepack enable && \
    yarn install --immutable && \
    yarn build

USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["yarn", "start"]
