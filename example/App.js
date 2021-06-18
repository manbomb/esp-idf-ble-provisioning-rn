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
            ToastAndroid.show("Custom data provided with success", ToastAndroid.LONG)
            console.log(resp)
        }).catch(e => {
            ToastAndroid.show("Provide custom data error", ToastAndroid.LONG)
            console.log(e)
        })
    }

    return (
        <View style={{ justifyContent: 'space-around', flex: 1, padding: 10, alignContent: 'center' }}>
            <Button title="SCAN Devices" onPress={scanFunc} />
            <Text style={{ color: "white", textAlign: "center" }}>Service UUID: {uuid}</Text>
            <Button title="Coonect to device" onPress={connectFun} />
            <Button title="Set pop" onPress={setProof} />
            <Button title="Get pop" onPress={getProof} />
            <Text style={{ color: "white", textAlign: "center" }}>Pop: {pop}</Text>
            <Button title="Scann networks" onPress={scanNetworks} />
            <Button title="Prov creds" onPress={provCreds} />
            <Button title="Prov custom data" onPress={provCustom} />
        </View>
    );
};

export default App;
