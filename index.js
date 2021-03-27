const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const { devices } = require('./data/devices.json');
const { gateways } = require('./data/gateways.json');
const { mobileDevices } = require('./data/mobileDevices.json');
const Network = require('./classes/Network');

const network = new Network(devices, mobileDevices, gateways);

app.get('/', (req, res) => {
  res.json('hi');
});

io.on('connection', (socket) => {
  socket.emit('welcome', { message: 'Welcome!', id: socket.id });
});

http.listen(3000, () => {
  console.log('Server Has Started!');
});
network.run(io);
