FROM mhart/alpine-node
MAINTAINER joshuabaker2@gmail.com
ADD ./package.json ./
RUN npm install


ADD ./index.js ./

EXPOSE 9000

CMD ["node", "index.js"]