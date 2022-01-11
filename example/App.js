import React, { useState } from 'react';
import {
    View,
    Button,
    Text,
    ToastAndroid
} from 'react-native';
import EspIdfBleProvisioningRn from "react-native-esp-idf-ble-provisioning-rn";


const App = () => {
    const [uuid, setUuid] = useState("");
    const [pop, setPop] = useState("");

    EspIdfBleProvisioningRn.create();

    const scanFunc = () => {
        console.log("scan init")
        EspIdfBleProvisioningRn.scanBleDevices("PROV_").then(res => {
            console.log(res)
            if (res.length > 0) {
                setUuid(res[0].serviceUuid);
            } else {
                setUuid("");
            }
        }).catch(e => {
            console.log(e)
        })
    }

    const connectFun = () => {
        EspIdfBleProvisioningRn.connectToBLEDevice(uuid).then(res => {
            ToastAndroid.show("Connected to device", ToastAndroid.LONG)
        }).catch(e => {
            ToastAndroid.show("Connect to device error", ToastAndroid.LONG)
            console.log(e)
        })
    }

    const setProof = () => {
        EspIdfBleProvisioningRn.setProofOfPossession("abcd1234");
        ToastAndroid.show("Pop: abcd1234", ToastAndroid.LONG)
    }

    const getProof = async () => {
        EspIdfBleProvisioningRn.getProofOfPossession().then((pop) => {
            setPop(pop)
        }).catch((e) => {
            ToastAndroid.show("Get pop error", ToastAndroid.LONG)
            console.error(e)
        })
    }

    const scanNetworks = () => {
        EspIdfBleProvisioningRn.scanNetworks().then(res => {
            ToastAndroid.show("Number of networks found: "+res.length, ToastAndroid.LONG)
        }).catch(e => {
            ToastAndroid.show("Scan networks error", ToastAndroid.LONG)
            console.log(e)
        })
    }

    const provCreds = () => {
        EspIdfBleProvisioningRn.provisionNetwork("SSIS", "PASS").then(resp => {
            ToastAndroid.show("Credentials provided with success", ToastAndroid.LONG)
            console.log(resp)
        }).catch(e => {
            ToastAndroid.show("Provide creds error", ToastAndroid.LONG)
            console.log(e)
        })
    }

    const provCustom = () => {
        EspIdfBleProvisioningRn.sendCustomData("custom-endpoint", "testinho").then(resp => {
            ToastAndroid.show("Custom data provisioned successfully", ToastAndroid.LONG)
            console.log(resp)
        }).catch(e => {
            ToastAndroid.show("Provision Custom Data Error, " + e.getMessage(), ToastAndroid.LONG)
            console.log(e)
        })
    }

  const provCustomWithByteData = () => {
    // Often the strings communicating over BLE are really binary represented as UTF-8
    // however UTF-16 is the react-native spec for strings
    // These strings are usually generated with a cipher, perhaps protobuf (on npmjs)
    // what's important is that React-Native is programmed in C. And C will trim trailing
    // \x00 characters from strings. This has a big impact on BLE communication

    // usually using Protocl Buffers, one would cmd.serializeBinary()
    // which renders protcol buffer messages into binary wire format, a Uint8Array in JS
    // const cmdContent = cmd.serializeBinary();
    // however for demonstration let's start with a string with problematic trailing characters
    const string = 'R\u0000';
    console.log(string); // R�
    // render string as Uint8Array, a typed array that represents an array of 8-bit unsigned integers
    // this is the medium most common to protocol buffers
    const strToBuf = str => {
      var buf = new ArrayBuffer(str.length);
      var bufView = new Uint8Array(buf);
      for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return bufView;
    };
    const stringAsByteArray = strToBuf(string);
    console.log(stringAsByteArray); // [82, 0] these numbers are in decimal, need to be hexi
    // a Uint8Array in JS isn't exactly an array, more like {0: 82, 1:0} and yet there's more differences
    // below converts the Uint8Array into a JS array of strings,
    // each string is hexidecimal value of corresponding byte
    const hexArrayOfCmdContent = Object.keys(stringAsByteArray).map(i =>
      stringAsByteArray[i].toString(16),
    );
    // using JSON.stringify below so it makes clear whether the values are strings or numbers
    console.log('hexArrayOfCmdContent: ', JSON.stringify(hexArrayOfCmdContent)); // ["52", "0"]

    EspIdfBleProvisioningRn.sendCustomDataWithByteData(
      'custom-endpoint',
      hexArrayOfCmdContent,
    )
      .then(resp => {
        // this is worth tweaking, but I have found that the data response
        // is wrapped in some other packaging I have to strip away from
        // the beginning and then JSON parsing works. The Native Backend manages
        // encryption at the session level
        const data = JSON.parse(resp.data.substring(8));
        ToastAndroid.show(
          'Custom data with byte accuracy provisioned successfully',
          ToastAndroid.LONG,
        );
        console.log(data);
      })
      .catch(e => {
        console.log(e && e.message ? e.message : 'error querying live data');
      });
  };

  return (
    <View
      style={{
        justifyContent: 'space-around',
        flex: 1,
        padding: 10,
        alignContent: 'center',
      }}>
      <Button title="Scan Devices" onPress={scanFunc} />
      <Text style={{color: 'white', textAlign: 'center'}}>
        Service UUID: {uuid}
      </Text>
      <Button title="Connect to Device" onPress={connectFun} />
      <Button title="Set PoP" onPress={setProof} />
      <Button title="Get PoP" onPress={getProof} />
      <Text style={{color: 'white', textAlign: 'center'}}>Pop: {pop}</Text>
      <Button title="Scan Networks" onPress={scanNetworks} />
      <Button title="Provision WiFi Credentials" onPress={provCreds} />
      <Button title="Provision Custom Data" onPress={provCustom} />
      <Button
        title="Provision Custom Data with Byte Information"
        onPress={provCustomWithByteData}
      />
    </View>
  );
};

export default App;
