FROM node:alpine

ENV PKG_CONFIG_PATH=/usr/share/OpenCV/lib/pkgconfig

RUN mkdir -p /app/data && mkdir -p /app/storage && \
    echo 'http://dl-cdn.alpinelinux.org/alpine/edge/testing' >> /etc/apk/repositories

WORKDIR /app

COPY package.json .

RUN apk update && \
    apk add --no-cache opencv-dev bash vips-dev fftw-dev && \
    apk add --virtual gyp python make g++ pkgconfig && \
    npm i -g yarn && \
    yarn install && \
    apk del gyp

COPY . .

EXPOSE 9009

CMD [ "yarn", "start-dev" ]
