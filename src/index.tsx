import { NativeModules } from 'react-native';

type EspIdfBleProvisioningRnType = {
  create(): void;
  scanBleDevices(prefix: String): Promise<Array<Object>>;
  setProofOfPossession(proof: String): void;
  getProofOfPossession(): Promise<String>;
  connectToBLEDevice(uuid: String): Promise<Object>;
  scanNetworks(): Promise<Array<Object>>;
  sendCustomData(customEndPoint: String, customData: String): Promise<Object>;
  provisionNetwork(ssid: String, password: String): Promise<Object>;
};

const { EspIdfBleProvisioningRn } = NativeModules;

export default EspIdfBleProvisioningRn as EspIdfBleProvisioningRnType;
