# react-native-esp-idf-ble-provisioning-rn

A module to do wifi/custom data provisioning to ESP IDF.
<br/><br/>

## Installation

```sh
npm install react-native-esp-idf-ble-provisioning-rn
```
<br/>

## Minimum SDK Version

This module requires a minimum sdk version of 23 or higher. Look this page if you need help to do this:
### [How to specify the minSdkVersion in react native project](https://stackoverflow.com/questions/51503218/how-to-specify-the-minsdkversion-in-react-native-project)
<br/>

## Permissions

The permissions needed for use this module are: ACCESS_FINE_LOCATION, BLUETOOTH, BLUETOOTH_ADMIN. Please check them before. Useful link:
### [Permissions Android - React Native](https://reactnative.dev/docs/permissionsandroid)
<br/>

## Usage
Example of usage with comments.

```js
import EspIdfBleProvisioningRn from "react-native-esp-idf-ble-provisioning-rn";

// This method initialize the provision manager, it
// Important: this should be the first method to be called, before all others
EspIdfBleProvisioningRn.create();

// This method returns an array of objects representing the BLE devices detected by the phone
EspIdfBleProvisioningRn.scanBleDevices("PREFIX_").then(res => {
    // res is the array of devices
}).catch(e => {
    console.error(e)
})

// This method allow you to connect with the device
// Call this method before the next methods
EspIdfBleProvisioningRn.connectToBLEDevice(uuid).then(res => {
    // res will be {"success":true}
}).catch(e => {
    console.error(e)
})

// This method allow you to set pop on device
EspIdfBleProvisioningRn.setProofOfPossession("popexample");

// To get the pop of device call this method
EspIdfBleProvisioningRn.getProofOfPossession().then((pop) => {
    // pop is a string
}).catch((e) => {
    console.error(e)
})

//This method return an array of detected networks with SSID, RSI, Security type and Password (often empty)
EspIdfBleProvisioningRn.scanNetworks().then(res => {
    // res is an array of detected networks
}).catch(e => {
    console.error(e)
})

// This method is used when is required to provision custom data to custom endpoints
EspIdfBleProvisioningRn.sendCustomData("custom-endpoint", "data").then(resp => {
    // res will be {"success":true}
}).catch(e => {
    console.error(e)
})

// This method is used to provision new wifi credentials on the device
EspIdfBleProvisioningRn.provisionNetwork("SSIS", "PASS").then(resp => {
    // resp will be {"success":true}
}).catch(e => {
    console.error(e)
})

```
<br/>

## Example app

You can find an useful example in this link: [Example app here](https://github.com/manbomb/esp-idf-ble-provisioning-rn/tree/master/example)
<br/><br/>
## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.
<br/><br/>
## License

MIT
