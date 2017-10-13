FROM centos:latest

ENV PKG_CONFIG_PATH=/usr/share/OpenCV/lib/pkgconfig

RUN mkdir -p /app/data && mkdir -p /app/storage

WORKDIR /app

COPY package.json .

RUN yum -y update && \
    yum -y install epel-release && \
    yum -y install nodejs npm opencv* bash python make gcc-c++ && \
    npm i -g yarn && \
    yarn install && \
    yum -y clean all

COPY . .

EXPOSE 9009

CMD [ "yarn", "start-dev" ]
