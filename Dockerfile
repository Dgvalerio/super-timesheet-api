FROM node:16-alpine

WORKDIR /home/api

COPY package.json .
COPY yarn.lock .

RUN yarn

CMD yarn && yarn start:dev
