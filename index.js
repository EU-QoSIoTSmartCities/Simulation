const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const { devices } = require('./data/devices.json');
const { gateways } = require('./data/gateways.json');
const { mobileDevices } = require('./data/mobileDevices.json');
const Network = require('./classes/Network');
const network = new Network(devices, mobileDevices, gateways);
network.run();
app.get('/', function (req, res) {
  res.send('index.html');
});

http.listen(3000, function () {});
io.on('connection', function (socket) {
  console.log('A user connected');

  socket.emit('mobileDevices', network.mobileDevices);
  socket.emit('gateways', network.gateways);
  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
    console.log('A user disconnected');
  });
});
