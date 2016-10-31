'use strict';

const Hapi = require('hapi');
const os = require('os');

const hostname = os.hostname();

const server = new Hapi.Server();

server.connection({
	port: 9000
});

server.route({
	method: 'GET',
	path: '/random',
	handler: (request, reply) => {

		// waste some cycles to make this slow

		const numbers = [];
		for (let i = 0; i < 42949600; i++) {
			numbers.push(Math.random());
		}

		// randomly take a random number in the array to return
		reply(`${hostname} generated: ${numbers[Math.floor(Math.random() * 8000)]}`);
	}
});

server.start(() => {
	console.log(`Server running at: ${server.info.uri}`);
});