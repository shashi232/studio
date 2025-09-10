import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FallDetection from '@/components/emergency/fall-detection';
import SosContacts from '@/components/emergency/sos-contacts';

export default function EmergencyPage() {
  return (
    <div className="container mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold text-primary">Emergency Features</h1>
        <p className="text-muted-foreground">Manage fall detection and emergency contacts.</p>
      </div>

      <Tabs defaultValue="fall-detection" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fall-detection">Fall Detection</TabsTrigger>
          <TabsTrigger value="sos-contacts">SOS Contacts</TabsTrigger>
        </TabsList>
        <TabsContent value="fall-detection">
          <FallDetection />
        </TabsContent>
        <TabsContent value="sos-contacts">
          <SosContacts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
