"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BluetoothConnected, BluetoothSearching, Loader2 } from 'lucide-react';
import { Progress } from '../ui/progress';

// Standard Bluetooth Service UUID for Serial Port Profile (SPP)
const SPP_SERVICE_UUID = '00001101-0000-1000-8000-00805f9b34fb';

export default function BluetoothConnection() {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      toast({
        title: 'Web Bluetooth Not Supported',
        description: 'Your browser does not support the Web Bluetooth API. Please use a compatible browser like Chrome on Android, Mac, or Windows.',
        variant: 'destructive',
      });
      return;
    }

    setIsScanning(true);
    try {
      const bleDevice = await navigator.bluetooth.requestDevice({
        // We accept all devices and then filter by services, which is a common
        // pattern for connecting to devices like ESP32 that might not advertise
        // services in a way that `filters` can pick up directly.
        acceptAllDevices: true,
        optionalServices: [SPP_SERVICE_UUID, 'battery_service', 'device_information'], // Add SPP and other common services
      });

      setDevice(bleDevice);
      toast({
        title: 'Device Found!',
        description: `Found device: ${bleDevice.name || 'Unnamed Device'}`,
      });

    } catch (error: any) {
      console.error('Bluetooth scan error:', error);
      let description = 'Could not find any devices. Please try again.';
      if (error.name === 'NotFoundError') {
        description = 'No devices found. Make sure your ESP32 is nearby and in pairing mode.';
      } else if (error.name === 'NotAllowedError') {
        description = 'Bluetooth access was denied. Please allow permissions and try again.';
      }
      
      toast({
        title: 'Scan Failed',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleConnect = async () => {
    if (!device) {
        toast({ title: 'No device selected', description: 'Please scan for a device first.', variant: 'destructive'});
        return;
    }

    if (device.gatt?.connected) {
        toast({ title: 'Already Connected'});
        setIsConnected(true);
        return;
    }
    
    setIsConnecting(true);
    try {
        const server = await device.gatt?.connect();
        // You could add logic here to discover services and characteristics
        // For now, we'll just confirm the connection.
        setIsConnected(true);
        toast({
            title: 'Connected!',
            description: `Successfully connected to ${device.name || 'Unnamed Device'}`,
        });
    } catch(error) {
        console.error('Bluetooth connect error:', error);
        toast({
            title: 'Connection Failed',
            description: 'Could not connect to the device. Please ensure it is in range and advertising the correct services.',
            variant: 'destructive',
        });
        setIsConnected(false);
    } finally {
        setIsConnecting(false);
    }
  }

  const handleDisconnect = () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
      // State change will be handled by the 'gattserverdisconnected' event listener
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


  return (
    <Card>
      <CardHeader>
        <CardTitle>Bluetooth Connection</CardTitle>
        <CardDescription>Scan for and connect to your ESP32 device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {(isScanning || isConnecting) && <Progress value={(isScanning || isConnecting) ? 33 : 0} className="w-full" />}
        
        {device && !isConnected && (
            <Card className="bg-accent/50">
                <CardContent className="flex items-center justify-between p-4">
                    <p className="font-semibold">Found: {device.name || 'Unnamed Device'}</p>
                    <Button onClick={handleConnect} disabled={isConnecting}>
                        {isConnecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BluetoothConnected className="mr-2 h-5 w-5" />}
                        Connect
                    </Button>
                </CardContent>
            </Card>
        )}

        {isConnected && device && (
             <Card className="border-green-500 bg-green-500/10">
                <CardContent className="flex items-center justify-between p-4">
                    <div>
                        <p className="font-semibold text-green-700">Connected to:</p>
                        <p>{device.name || 'Unnamed Device'}</p>
                    </div>
                    <Button variant="destructive" onClick={handleDisconnect}>
                        Disconnect
                    </Button>
                </CardContent>
            </Card>
        )}

        {!device && (
            <Button onClick={handleScan} disabled={isScanning} className="w-full" size="lg">
            {isScanning ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <BluetoothSearching className="mr-2 h-5 w-5" />
            )}
            {isScanning ? 'Scanning...' : 'Scan for ESP32'}
            </Button>
        )}

        <div className="text-xs text-muted-foreground p-4 border rounded-lg">
          <p><strong>Note:</strong> Make sure your ESP32 has Bluetooth enabled and is discoverable. This feature uses the Web Bluetooth API, which is only available in some modern browsers (like Chrome) on Windows, Mac, Linux, and Android. It is not available on iOS.</p>
        </div>
      </CardContent>
    </Card>
  );
}
