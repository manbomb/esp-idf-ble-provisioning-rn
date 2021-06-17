import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import EspIdfBleProvisioningRn from 'react-native-esp-idf-ble-provisioning-rn';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Result:</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
