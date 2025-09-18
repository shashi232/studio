
"use client";

import React, { createContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/lib/hooks/use-local-storage';

// Custom UUIDs from the DRISHTI_Stick ESP32 Code
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

type StoredDevice = {
    id: string;
    name: string | null;
}

interface AppContextType {
  isFallDetected: boolean;
  triggerFallAlert: () => void;
  dismissFallAlert: () => void;
  
  // Bluetooth State
  isScanning: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  device: BluetoothDevice | null;
  lastDevice: StoredDevice | null;
  autoConnect: boolean;
  setAutoConnect: (value: boolean) => void;

  // Bluetooth Actions
  handleScan: () => Promise<void>;
  handleConnect: (deviceToConnect: BluetoothDevice) => Promise<void>;
  handleDisconnect: () => void;
}

export const AppContext = createContext<AppContextType>({
  isFallDetected: false,
  triggerFallAlert: () => {},
  dismissFallAlert: () => {},
  isScanning: false,
  isConnecting: false,
  isConnected: false,
  device: null,
  lastDevice: null,
  autoConnect: false,
  setAutoConnect: () => {},
  handleScan: async () => {},
  handleConnect: async () => {},
  handleDisconnect: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isFallDetected, setIsFallDetected] = useState(false);
  const { toast } = useToast();

  const triggerFallAlert = useCallback(() => {
    setIsFallDetected(true);
  }, []);

  const dismissFallAlert = useCallback(() => {
    setIsFallDetected(false);
  }, []);

  // --- Bluetooth State and Logic ---
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  
  const [lastDevice, setLastDevice] = useLocalStorage<StoredDevice | null>('last-bt-device', null);
  const [autoConnect, setAutoConnect] = useLocalStorage('bt-autoconnect', false);

  const handleNotifications = useCallback((event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (value) {
      const decoder = new TextDecoder('utf-8');
      const message = decoder.decode(value);
      console.log('Received from ESP32:', message);
      
      if (message.includes('FALL')) {
        toast({
          title: 'Fall Detected by Device!',
          description: 'DRISHTI device triggered a fall alert.',
          variant: 'destructive',
        });
        triggerFallAlert();
      }
    }
  }, [toast, triggerFallAlert]);
  
  const setupNotifications = async (server: BluetoothRemoteGATTServer) => {
    try {
        const service = await server.getPrimaryService(SERVICE_UUID);
        const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleNotifications);
        
        toast({
            title: 'Notifications Enabled',
            description: 'Listening for messages from your DRISHTI device.',
        });
    } catch(error) {
        console.error('Notification setup error:', error);
        toast({
            title: 'Listener Failed',
            description: 'Could not set up a listener for device messages.',
            variant: 'destructive',
        });
    }
  }

  const handleConnect = useCallback(async (deviceToConnect: BluetoothDevice) => {
    if (!deviceToConnect) {
        toast({ title: 'No device selected', description: 'Please scan for a device first.', variant: 'destructive'});
        return;
    }
    
    // Set the device in context if it's not already set
    if (device?.id !== deviceToConnect.id) {
        setDevice(deviceToConnect);
    }

    if (deviceToConnect.gatt?.connected) {
        toast({ title: 'Already Connected'});
        setIsConnected(true);
        return;
    }
    
    setIsConnecting(true);
    try {
        const server = await deviceToConnect.gatt?.connect();
        if (server) {
            setIsConnected(true);
            toast({
                title: 'Connected!',
                description: `Successfully connected to ${deviceToConnect.name || 'Unnamed Device'}`,
            });
            setLastDevice({ id: deviceToConnect.id, name: deviceToConnect.name || null });
            await setupNotifications(server);
        } else {
            throw new Error("Could not get GATT server.");
        }
    } catch(error) {
        console.error('Bluetooth connect error:', error);
        toast({
            title: 'Connection Failed',
            description: 'Could not connect to the device.',
            variant: 'destructive',
        });
        setIsConnected(false);
        setDevice(null);
    } finally {
        setIsConnecting(false);
    }
  }, [device, setLastDevice, toast, setupNotifications]);

  const handleScan = async () => {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      toast({
        title: 'Web Bluetooth Not Supported',
        description: 'Your browser does not support the Web Bluetooth API.',
        variant: 'destructive',
      });
      return;
    }

    setIsScanning(true);
    
    try {
      const bleDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID],
      });

      toast({
          title: 'Device Found!',
          description: `Found device: ${bleDevice.name || 'Unnamed Device'}`,
      });
      
      await handleConnect(bleDevice);

    } catch (error: any) {
      if (error.name !== 'NotFoundError') {
        const description = 'Could not find any devices. Please try again.';
        toast({
          title: 'Scan Failed',
          description,
          variant: 'destructive',
        });
      }
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleDisconnect = () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
  };

  useEffect(() => {
    const onDisconnected = () => {
        setIsConnected(false);
        setDevice(null);
        toast({ title: 'Device Disconnected'});
    };

    if (device) {
        device.addEventListener('gattserverdisconnected', onDisconnected);
    }

    return () => {
        if (device) {
            device.removeEventListener('gattserverdisconnected', onDisconnected);
        }
    };
  }, [device, toast]);
  
  // Effect for auto-connecting
  useEffect(() => {
    const autoConnectOnLoad = async () => {
        if (autoConnect && lastDevice && !isConnected && !isConnecting && !device && typeof navigator.bluetooth?.getDevices === 'function') {
            const permittedDevices = await navigator.bluetooth.getDevices();
            const lastUsedDevice = permittedDevices.find(d => d.name === lastDevice.name);

            if (lastUsedDevice) {
                toast({ title: 'Auto-connecting...', description: `Found saved device: ${lastUsedDevice.name}`});
                await handleConnect(lastUsedDevice);
            }
        }
    }
    autoConnectOnLoad();
    // The dependency array is intentionally missing `handleConnect` because including it
    // can cause re-renders that lead to race conditions. The function's reference is stable.
  }, [autoConnect, lastDevice, isConnected, isConnecting, device, toast]);


  const contextValue = useMemo(() => ({
    isFallDetected,
    triggerFallAlert,
    dismissFallAlert,
    isScanning,
    isConnecting,
    isConnected,
    device,
    lastDevice,
    autoConnect,
    setAutoConnect,
    handleScan,
    handleConnect,
    handleDisconnect,
  }), [isFallDetected, triggerFallAlert, dismissFallAlert, isScanning, isConnecting, isConnected, device, lastDevice, autoConnect, setAutoConnect, handleScan, handleConnect, handleDisconnect]);


  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
