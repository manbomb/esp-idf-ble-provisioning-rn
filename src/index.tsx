import { NativeModules } from 'react-native';

type EspIdfBleProvisioningRnType = {
  multiply(a: number, b: number): Promise<number>;
};

const { EspIdfBleProvisioningRn } = NativeModules;

export default EspIdfBleProvisioningRn;
