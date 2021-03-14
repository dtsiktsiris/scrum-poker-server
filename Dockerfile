FROM node:14-alpine

RUN mkdir /app
WORKDIR /app

COPY package.json package.json
RUN npm install && mv node_modules /node_modules

COPY . .

LABEL maintainer="Dimitris Tsiktsiris <dtsiktsiris@outlook.com"

CMD npm start