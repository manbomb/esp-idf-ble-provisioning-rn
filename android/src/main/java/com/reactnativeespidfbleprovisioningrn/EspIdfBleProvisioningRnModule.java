package com.reactnativeespidfbleprovisioningrn;

import android.Manifest;
import android.annotation.TargetApi;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.ScanResult;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.support.v4.app.ActivityCompat;
import android.util.Log;

import com.espressif.provisioning.DeviceConnectionEvent;
import com.espressif.provisioning.ESPConstants;
import com.espressif.provisioning.ESPProvisionManager;
import com.espressif.provisioning.WiFiAccessPoint;
import com.espressif.provisioning.listeners.BleScanListener;
import com.espressif.provisioning.listeners.ProvisionListener;
import com.espressif.provisioning.listeners.WiFiScanListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import java.util.ArrayList;
import java.util.HashMap;

public class EspIdfBleProvisioningRnModule extends ReactContextBaseJavaModule {
    public EspIdfBleProvisioningRnModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = context;
    }

  private static final String TAG = "NAT. MOD. ESP PROV::";

  private ReactApplicationContext context;
  private ESPProvisionManager provisionManager;
  private Handler handler;
  private HashMap<String, BluetoothDevice> listDevicesByUuid;
  private WritableArray listDeviceNamesByUuid;

  private boolean deviceConnected = false;
  private boolean promiseConnectionFinished = false;

  private Promise promiseScan;
  private Promise promiseConnection;
  private Promise promiseNetworkScan;
  private Promise promiseNetworkProvision;

  BleScanListener bleScanListener = new BleScanListener() {
    @Override
    public void scanStartFailed() {
      Log.e(TAG, "Scan start fail (please turn on BT)");
      promiseScan.reject("Scan start error",
        "Please turn or Bluetooth on device",
        new Exception());
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    @Override
    public void onPeripheralFound(BluetoothDevice device, ScanResult scanResult) {
      try {
        Log.e(TAG, "Peripheral found");
        String deviceName = device.getName();
        String serviceUuid = null;

        if (scanResult.getScanRecord().getServiceUuids() != null &&
          scanResult.getScanRecord().getServiceUuids().size() > 0) {
          serviceUuid = scanResult.getScanRecord().getServiceUuids().get(0).toString();
        }

        if (serviceUuid != null && !listDevicesByUuid.containsKey(serviceUuid)) {
          WritableMap newDevice = Arguments.createMap();
          newDevice.putString("serviceUuid", serviceUuid);
          newDevice.putString("deviceName", deviceName);
          listDeviceNamesByUuid.pushMap(newDevice);
          listDevicesByUuid.put(serviceUuid, device);
        }
      } catch (Exception e) {
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
          return;
        }
        ESPProvisionManager.getInstance(context).stopBleScan();
        Log.e(TAG, "Error on Peripheral found");
        promiseScan.reject("Device found error",
          "An error has occurred while scanning", e);
      }
    }

    @Override
    public void scanCompleted() {
      Log.e(TAG, "Scan completed");
      promiseScan.resolve(listDeviceNamesByUuid);
    }

    @Override
    public void onFailure(Exception e) {
      Log.e(TAG, "Scan fail");
      promiseScan.reject("Scan BLE error", "Scan BLE devices Failed", e);
    }
  };

  WiFiScanListener wiFiScanListener = new WiFiScanListener() {
    @TargetApi(Build.VERSION_CODES.N)
    @Override
    public void onWifiListReceived(ArrayList<WiFiAccessPoint> wifiList) {
      WritableArray listOfNetworks = Arguments.createArray();
      wifiList.forEach((wiFiAccessPoint) -> {
        WritableMap newElement = Arguments.createMap();
        newElement.putString("ssid", wiFiAccessPoint.getWifiName());
        newElement.putString("password", wiFiAccessPoint.getPassword());
        newElement.putInt("rssi", wiFiAccessPoint.getRssi());
        newElement.putInt("security", wiFiAccessPoint.getSecurity());
        listOfNetworks.pushMap(newElement);
      });
      promiseNetworkScan.resolve(listOfNetworks);
    }

    @Override
    public void onWiFiScanFailed(Exception e) {
      promiseNetworkScan.reject("Network Scan Error",
        "WiFi networks scan has failed", e);
    }
  };

  ProvisionListener provisionListener = new ProvisionListener() {
    @Override
    public void createSessionFailed(Exception e) {
      Log.e(TAG, "Session creation is failed");
      promiseNetworkProvision.reject("Error in provision listener",
        "Session creation is failed", e);
    }

    @Override
    public void wifiConfigSent() {
      Log.e(TAG, "Wi-Fi credentials successfully sent to the device");
    }

    @Override
    public void wifiConfigFailed(Exception e) {
      Log.e(TAG, "Wi-Fi credentials failed to send to the device");
      promiseNetworkProvision.reject("Error in provision listener",
        "Wi-Fi credentials failed to send to the device", e);
    }

    @Override
    public void wifiConfigApplied() {
      Log.e(TAG, "Wi-Fi credentials successfully applied to the device");
    }

    @Override
    public void wifiConfigApplyFailed(Exception e) {
      Log.e(TAG, "Wi-Fi credentials failed to apply to the device");
      promiseNetworkProvision.reject("Error in provision listener",
        "Wi-Fi credentials failed to apply to the device", e);
    }

    @Override
    public void provisioningFailedFromDevice(ESPConstants.ProvisionFailureReason failureReason) {
      Log.e(TAG, "provisioningFailedFromDevice: "+failureReason.toString());
      promiseNetworkProvision.reject("Error in provision listener",
        "provisioningFailedFromDevice: "+failureReason.toString(),
        new Exception());
    }

    @Override
    public void deviceProvisioningSuccess() {
      Log.e(TAG, "Device is provisioned successfully");
      WritableMap res = Arguments.createMap();
      res.putBoolean("success", true);
      promiseNetworkProvision.resolve(res);
    }

    @Override
    public void onProvisioningFailed(Exception e) {
      Log.e(TAG, "Provisioning is failed");
      promiseNetworkProvision.reject("Error in provision listener",
        "Provisioning is failed", e);
    }
  };

  @ReactMethod
  public void create() {
    try {
      provisionManager = ESPProvisionManager.getInstance(context);
      EventBus.getDefault().register(this);
      Log.e(TAG, "Create method");
    } catch (Exception e) {
      Log.e(TAG, "Error on Create method");
    }
  }

  @ReactMethod
  public void scanBleDevices(String prefix, Promise promise) {
    try {
      if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
        return;
      }
      Log.e(TAG, "Scan started");
      this.promiseScan = promise;
      listDevicesByUuid = new HashMap<String, BluetoothDevice>();
      listDeviceNamesByUuid = Arguments.createArray();
      provisionManager.searchBleEspDevices(prefix, bleScanListener);
    } catch (Exception e) {
      Log.e(TAG, "Error on Init scan method");
      promise.reject("Error on Init scan method",
        "Init scan method has failed", e);
    }
  }

  @ReactMethod
  public void setProofOfPossession(String proof) {
    provisionManager.getEspDevice().setProofOfPossession(proof);
  }

  @ReactMethod
  public void getProofOfPossession(Promise promise) {
    promise.resolve(provisionManager.getEspDevice().getProofOfPossession());
  }

  @ReactMethod
  public void connectToBLEDevice(String uuid, Promise promise) {
    if (!listDevicesByUuid.containsKey(uuid)) {
      Log.e(TAG, "Device don't exists");
      promise.reject("Device don't exists",
        "Please choose a valid device",
        new Exception());
      return;
    }
    try {
      BluetoothDevice device = listDevicesByUuid.get(uuid);
      provisionManager.createESPDevice(ESPConstants.TransportType.TRANSPORT_BLE,
        ESPConstants.SecurityType.SECURITY_1);
      provisionManager.getEspDevice().connectBLEDevice(device, uuid);
      promiseConnection = promise;
      promiseConnectionFinished = false;
    } catch (Exception e) {
      Log.e(TAG, "Error trying to connect to device");
      promise.reject("Error trying to connect to device",
        "An error has occurred while creation or connection of device",
        e);
    }
  }

  @ReactMethod
  public void scanNetworks(Promise promise) {
    if (!deviceConnected) {
      Log.e(TAG, "No device connected");
      promise.reject("No device connected",
        "Please connect a device first",
        new Exception());
      return;
    }
    try {
      provisionManager.getEspDevice().scanNetworks(wiFiScanListener);
      this.promiseNetworkScan = promise;
    } catch (Exception e) {
      promise.reject("Networks scan init error",
        "An error has occurred in initialization of networks scan",
        e);
    }
  }

  @ReactMethod
  public void provisionNetwork(String ssid, String pass, Promise promise) {
    try {
      provisionManager.getEspDevice().provision(ssid, pass, provisionListener);
      this.promiseNetworkProvision = promise;
    } catch (Exception e) {
      promise.reject("Credentials provision init error",
        "An error has occurred in init of provisioning of credentials", e);
    }
  }

  @Subscribe(threadMode = ThreadMode.MAIN)
  public void onEvent(DeviceConnectionEvent event) {

    Log.e(TAG, "ON Device Prov Event RECEIVED : " + event.getEventType());
    //handler.removeCallbacks(disconnectDeviceTask);

    switch (event.getEventType()) {
      case ESPConstants.EVENT_DEVICE_CONNECTED:
        Log.e(TAG, "Device Connected Event Received");
        deviceConnected = true;
        if (promiseConnectionFinished) {
          break;
        }
        WritableMap res = Arguments.createMap();
        res.putBoolean("Success", true);
        promiseConnectionFinished = true;
        promiseConnection.resolve(res);
        break;

      case ESPConstants.EVENT_DEVICE_DISCONNECTED:
        Log.e(TAG, "Device disconnected");
        deviceConnected = false;
        break;

      case ESPConstants.EVENT_DEVICE_CONNECTION_FAILED:
        Log.e(TAG, "Device connection failed");
        if (promiseConnectionFinished) {
          break;
        }
        promiseConnectionFinished = true;
        promiseConnection.reject("Device connection failed",
          "The device connection has failed",
          new Exception());
        break;
    }
  }

  @Override
  public String getName() {
        return "EspIdfBleProvisioningRn";
    }
}
