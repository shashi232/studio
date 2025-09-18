import BluetoothConnection from '@/components/connectivity/bluetooth-connection';

export default function ConnectivityPage() {
  return (
    <div className="container mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold text-primary">Connectivity</h1>
        <p className="text-muted-foreground">Connect to your DRISHTI device.</p>
      </div>
      
      <BluetoothConnection />
    </div>
  );
}
