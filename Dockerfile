FROM node:5.11

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

EXPOSE 80
CMD ["node", "server-app/app.js", "80", "http://watchlist.benjamentech.com", "mongodb"]
