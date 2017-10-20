FROM node:boron

RUN	apt-get update && apt-get install -y \
	net-tools \
	iproute

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]