FROM node:18.1.0-alpine

RUN mkdir /app
WORKDIR /app
ADD . /app/
RUN npm install --no-optional --production

CMD ["npm", "start"]
