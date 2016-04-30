FROM node:5.11-onbuild

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g bower

COPY package.json /usr/src/app
RUN npm install --production

COPY bower.json /usr/src/app
RUN bower install --production --allow-root
COPY . /usr/src/app

EXPOSE 8081
CMD ["node", "server-app/app.js"]
