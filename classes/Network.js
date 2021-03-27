const haversine = require('haversine');
const sleep = require('sleep');

const Device = require('./Device');
const Gateway = require('./Gateway');
const MobileDevice = require('./MobileDevice');

class Network {
  constructor(devices, mobileDevices, gateways) {
    this.devices = devices.map((device) => {
      return new Device(device.id, device.location, device.gateway);
    });
    this.mobileDevices = mobileDevices.map((mobileDevice) => {
      return new MobileDevice(
        mobileDevice.id,
        mobileDevice.location,
        mobileDevice.gateway,
        mobileDevice.trajectory
      );
    });
    this.gateways = gateways.map((gateway) => {
      return new Gateway(gateway.id, gateway.location, gateway.devices);
    });
  }
  initialize = () => {
    this.devices.forEach((device) => {
      let distances = this.gateways.map((gateway) => {
        let start = {
          latitude: device.location[0],
          longitude: device.location[1],
        };
        let end = {
          latitude: gateway.location[0],
          longitude: gateway.location[1],
        };
        return {
          gateway,
          distance: haversine(start, end),
        };
      });
      let closestGateway;
      let closest = Infinity;
      distances.forEach((gateway) => {
        if (gateway.distance < closest) {
          closest = gateway.distance;
          closestGateway = gateway.gateway;
        }
      });
      device.gateway = closestGateway;
      device.gateway.devices.push(device);
    });

    this.mobileDevices.forEach((mobileDevice) => {
      let distances = this.gateways.map((gateway) => {
        let start = {
          latitude: mobileDevice.location[0],
          longitude: mobileDevice.location[1],
        };
        let end = {
          latitude: gateway.location[0],
          longitude: gateway.location[1],
        };
        return {
          gateway,
          distance: haversine(start, end),
        };
      });
      let closestGateway;
      let closest = Infinity;
      distances.forEach((gateway) => {
        if (gateway.distance < closest) {
          closest = gateway.distance;
          closestGateway = gateway.gateway;
        }
      });
      mobileDevice.gateway = closestGateway;
      mobileDevice.gateway.devices.push(mobileDevice);
    });
  };
  simulate = (t) => {
    this.mobileDevices.forEach((mobileDevice) => {
      let distances = this.gateways.map((gateway) => {
        let start = {
          latitude: mobileDevice.trajectory[t][0],
          longitude: mobileDevice.trajectory[t][1],
        };
        let end = {
          latitude: gateway.location[0],
          longitude: gateway.location[1],
        };
        return {
          gateway,
          distance: haversine(start, end),
        };
      });
      let closestGateway;
      let closest = Infinity;
      distances.forEach((gateway) => {
        if (gateway.distance < closest) {
          closest = gateway.distance;
          closestGateway = gateway.gateway;
        }
      });
      let memory = mobileDevice.gateway;
      mobileDevice.gateway = closestGateway;
      if (memory.id != mobileDevice.gateway.id) {
        const updated = memory.devices.filter(
          (device) => device.id != mobileDevice.id
        );
        memory.devices = updated;
        mobileDevice.gateway.devices.push(mobileDevice);
      }
    });
    this.gateways.forEach((gateway) => gateway.run());
    const gatewayData = [
      {
        gateway: this.gateways[0].id,
        throughput: this.gateways[0].output,
        connectedDevices: this.gateways[0].devices.length,
      },
      {
        gateway: this.gateways[1].id,
        throughput: this.gateways[1].output,
        connectedDevices: this.gateways[1].devices.length,
      },
      {
        gateway: this.gateways[2].id,
        throughput: this.gateways[2].output,
        connectedDevices: this.gateways[2].devices.length,
      },
    ];

    const mobileData = [
      {
        mobileDeviceId: this.mobileDevices[0].id,
        connectedGateway: this.mobileDevices[0].gateway.id,
      },
    ];
    console.table(gatewayData);
    console.table(mobileData);
  };

  run = (io) => {
    this.initialize();
    for (
      let index = 0;
      index < this.mobileDevices[0].trajectory.length;
      index++
    ) {
      this.simulate(index);
      const gatewayData = this.gateways.map((gateway) => {
        return {};
      });
      io.emit('hi', { devices: [{ id: 1, location: [] }] });
      sleep.msleep(1000);
    }
  };
}

module.exports = Network;
