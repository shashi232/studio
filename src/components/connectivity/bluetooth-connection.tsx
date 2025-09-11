
"use client";

import { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BluetoothConnected, BluetoothSearching, Loader2 } from 'lucide-react';
import { Progress } from '../ui/progress';
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
    handleConnect,
    handleDisconnect,
  } = useContext(AppContext);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bluetooth Connection</CardTitle>
        <CardDescription>Scan for and connect to your ESP32 device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
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
        
        {(isScanning || isConnecting) && <Progress value={isScanning ? 33 : isConnecting ? 66 : 0} className="w-full" />}
        
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

        {!device && !isConnected && (
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
