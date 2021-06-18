import { NativeModules } from 'react-native';

interface EspIdfBleProvisioningRnType {
  create(): void;
  scanBleDevices(prefix: string): Promise<Array<Object>>;
  setProofOfPossession(proof: string): void;
  getProofOfPossession(): Promise<string>;
  connectToBLEDevice(uuid: string): Promise<Object>;
  scanNetworks(): Promise<Array<Object>>;
  sendCustomData(customEndPoint: string, customData: string): Promise<Object>;
  provisionNetwork(ssid: string, password: string): Promise<Object>;
};

const { EspIdfBleProvisioningRn } = NativeModules;

export default EspIdfBleProvisioningRn as EspIdfBleProvisioningRnType;
