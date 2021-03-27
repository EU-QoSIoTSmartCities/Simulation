const Device = require('./Device');

class MobileDevice {
  constructor(id, location, gateway, trajectory) {
    this.id = id;
    this.location = location;
    this.gateway = gateway;
    this.trajectory = trajectory;
  }
}

module.exports = MobileDevice;
