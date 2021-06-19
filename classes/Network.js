const haversine = require('haversine');
const sleep = require('sleep');
const Device = require('./Device');
const Gateway = require('./Gateway');
const MobileDevice = require('./MobileDevice');
const { performance } = require('perf_hooks');
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
      {
        gateway: this.gateways[3].id,
        throughput: this.gateways[3].output,
        connectedDevices: this.gateways[3].devices.length,
      },
      {
        gateway: this.gateways[4].id,
        throughput: this.gateways[4].output,
        connectedDevices: this.gateways[4].devices.length,
      },
      {
        gateway: this.gateways[5].id,
        throughput: this.gateways[5].output,
        connectedDevices: this.gateways[5].devices.length,
      },
      {
        gateway: this.gateways[6].id,
        throughput: this.gateways[6].output,
        connectedDevices: this.gateways[6].devices.length,
      },
    ];

    const mobileData = [
      {
        mobileDeviceId: this.mobileDevices[0].id,
        connectedGateway: this.mobileDevices[0].gateway.id,
      },
      {
        mobileDeviceId: this.mobileDevices[1].id,
        connectedGateway: this.mobileDevices[1].gateway.id,
      },
      {
        mobileDeviceId: this.mobileDevices[2].id,
        connectedGateway: this.mobileDevices[2].gateway.id,
      },
    ];
    console.table(gatewayData);
    console.table(mobileData);
  };

  run = (io) => {
    this.initialize();
    console.log(this.devices.length);
    for (
      let index = 0;
      index < this.mobileDevices[0].trajectory.length;
      index++
    ) {
      const t0 = performance.now();
      this.simulate(index);
      const t1 = performance.now();
      const gatewayData = this.gateways.map((gateway) => {
        return {};
      });
      console.log(t1 - t0);
      sleep.sleep(1); // every 10 sec check mobile
    }
  };
}

module.exports = Network;
