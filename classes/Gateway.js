class Gateway {
  constructor(id, location, devices) {
    this.id = id;
    this.location = location;
    this.devices = devices;
    this.output = null;
  }

  run = () => {
    this.output = Math.random();
  };
}

module.exports = Gateway;
