FROM node:alpine

RUN mkdir -p /app/data && mkdir -p /app/storage

WORKDIR /app

COPY package.json .

RUN apk add --update --no-cache bash && \
    npm i -g yarn && \
    yarn install

COPY . .

EXPOSE 3000

CMD [ "yarn", "start" ]
