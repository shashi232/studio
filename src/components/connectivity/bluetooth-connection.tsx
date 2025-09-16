
"use client";

import { useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BluetoothSearching, Loader2 } from 'lucide-react';
import { AppContext } from '@/context/app-context';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';


export default function BluetoothConnection() {
  const { 
    isScanning,
    isConnecting,
    isConnected,
    device,
    lastDevice,
    autoConnect,
    setAutoConnect,
    handleScan,
    handleDisconnect,
  } = useContext(AppContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showScanButton = !isConnected && !isConnecting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bluetooth Connection</CardTitle>
        <CardDescription>Scan for and connect to your ESP32 device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {isClient && (
          <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="autoconnect-switch" className="flex-grow">
                <h3 className="font-medium">Auto-connect</h3>
                <p className="text-xs text-muted-foreground">
                  {lastDevice ? `Automatically connect to ${lastDevice.name}` : 'No previous device saved.'}
                </p>
              </Label>
              <Switch
                id="autoconnect-switch"
                checked={autoConnect}
                onCheckedChange={setAutoConnect}
                disabled={!lastDevice}
                aria-label="Toggle autoconnect"
              />
            </div>
        )}
        
        {(isConnecting) && (
             <div className="flex items-center justify-center space-x-2 p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Connecting to {device?.name || 'device'}...</span>
            </div>
        )}

        {isConnected && device && (
             <Card className="border-green-500 bg-green-500/10">
                <CardContent className="flex items-center justify-between p-4">
                    <div>
                        <p className="font-semibold text-green-700 dark:text-green-400">Connected to:</p>
                        <p className="text-foreground">{device.name || 'Unnamed Device'}</p>
                    </div>
                    <Button variant="destructive" onClick={handleDisconnect}>
                        Disconnect
                    </Button>
                </CardContent>
            </Card>
        )}

        {showScanButton && (
            <Button onClick={handleScan} disabled={isScanning} className="w-full" size="lg">
            {isScanning ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <BluetoothSearching className="mr-2 h-5 w-5" />
            )}
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
            </Button>
        )}

        <div className="text-xs text-muted-foreground p-4 border rounded-lg">
          <p><strong>Note:</strong> Make sure your ESP32 has Bluetooth enabled and is discoverable. This feature uses the Web Bluetooth API, which is only available in some modern browsers (like Chrome) on Windows, Mac, Linux, and Android. It is not available on iOS.</p>
        </div>
      </CardContent>
    </Card>
  );
}
