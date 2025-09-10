import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ObstacleDetection from '@/components/detection/obstacle-detection';
import GroundHazardDetection from '@/components/detection/ground-hazard-detection';

export default function DetectionPage() {
  return (
    <div className="container mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold text-primary">Environment Detection</h1>
        <p className="text-muted-foreground">Use your camera to identify potential risks.</p>
      </div>

      <Tabs defaultValue="obstacle" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="obstacle">Obstacle Detection</TabsTrigger>
          <TabsTrigger value="hazard">Ground Hazards</TabsTrigger>
        </TabsList>
        <TabsContent value="obstacle">
          <ObstacleDetection />
        </TabsContent>
        <TabsContent value="hazard">
          <GroundHazardDetection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
