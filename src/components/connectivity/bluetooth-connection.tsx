"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bluetooth, BluetoothConnected, BluetoothSearching, Loader2 } from 'lucide-react';
import { Progress } from '../ui/progress';

export default function BluetoothConnection() {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!navigator.bluetooth) {
      toast({
        title: 'Web Bluetooth API not supported',
        description: 'Your browser does not support the Web Bluetooth API.',
        variant: 'destructive',
      });
      return;
    }

    setIsScanning(true);
    try {
      const bleDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        // Optional: Filter for specific services if you know them
        // services: ['battery_service'] 
      });

      setDevice(bleDevice);
      toast({
        title: 'Device Found!',
        description: `Found device: ${bleDevice.name || 'Unnamed Device'}`,
      });

    } catch (error) {
      console.error('Bluetooth scan error:', error);
      toast({
        title: 'Scan Failed',
        description: 'Could not find any devices. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleConnect = async () => {
    if (!device) {
        toast({ title: 'No device selected', variant: 'destructive'});
        return;
    }

    setIsScanning(true); // Re-use for loading state
    try {
        if (device.gatt?.connected) {
            toast({ title: 'Already Connected'});
            setIsConnected(true);
            setIsScanning(false);
            return;
        }

        await device.gatt?.connect();
        setIsConnected(true);
        toast({
            title: 'Connected!',
            description: `Successfully connected to ${device.name || 'Unnamed Device'}`,
        });
    } catch(error) {
        console.error('Bluetooth connect error:', error);
        toast({
            title: 'Connection Failed',
            description: 'Could not connect to the device.',
            variant: 'destructive',
        });
        setIsConnected(false);
    } finally {
        setIsScanning(false);
    }
  }

  const handleDisconnect = () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
      setIsConnected(false);
      setDevice(null);
      toast({ title: 'Disconnected' });
    }
  };

  useEffect(() => {
    const onDisconnected = () => {
        setIsConnected(false);
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
        <CardDescription>Scan for and connect to your walking stick via Bluetooth.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {isScanning && <Progress value={33} className="w-full" />}
        
        {device && !isConnected && (
            <Card className="bg-accent/50">
                <CardContent className="flex items-center justify-between p-4">
                    <p className="font-semibold">Found: {device.name || 'Unnamed Device'}</p>
                    <Button onClick={handleConnect} disabled={isScanning}>
                        {isScanning ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BluetoothConnected className="mr-2 h-5 w-5" />}
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
            {isScanning ? 'Scanning...' : 'Scan for Bluetooth Devices'}
            </Button>
        )}

        <div className="text-xs text-muted-foreground p-4 border rounded-lg">
          <p><strong>Note:</strong> This feature uses the Web Bluetooth API, which is only available in some modern browsers (like Chrome) on Windows, Mac, Linux, and Android. It is not available on iOS.</p>
        </div>
      </CardContent>
    </Card>
  );
}
