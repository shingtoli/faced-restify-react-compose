FROM node:alpine

RUN mkdir -p /app/data && mkdir -p /app/storage

WORKDIR /app

COPY package.json .

RUN apk add --update --no-cache opencv bash && \
    npm i -g yarn && \
    yarn install

COPY ./dist ./dist

EXPOSE 9009

CMD [ "yarn", "start" ]
