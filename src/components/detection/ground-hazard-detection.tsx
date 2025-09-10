"use client";

import { useState } from 'react';
import Image from 'next/image';
import { detectGroundHazard, type DetectGroundHazardOutput } from '@/ai/flows/ground-hazard-detection-with-vibrations';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Waves, Footprints, Loader2, ScanLine } from 'lucide-react';

const hazardImage = PlaceHolderImages.find(img => img.id === 'hazard-1');

async function toDataURL(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function GroundHazardDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectGroundHazardOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!hazardImage) {
      setError("Placeholder image not found.");
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const dataUri = await toDataURL(hazardImage.imageUrl);
      const res = await detectGroundHazard({
        photoDataUri: dataUri,
        proximityThreshold: 10,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
      setError("Failed to process image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ground Hazard Sensing</CardTitle>
        <CardDescription>Recognizes ground hazards like steps or uneven surfaces.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hazardImage && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={hazardImage.imageUrl}
              alt={hazardImage.description}
              fill
              className="object-cover"
              data-ai-hint={hazardImage.imageHint}
            />
          </div>
        )}
        
        <Button onClick={handleScan} disabled={isLoading} className="w-full" size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <ScanLine className="mr-2 h-5 w-5" />
          )}
          {isLoading ? 'Scanning...' : 'Scan for Ground Hazards'}
        </Button>

        {result && (
          <Card className="bg-accent/50">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-4">
                <Footprints className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Hazard Detected</p>
                  <p className="text-lg font-semibold text-accent-foreground">{result.hazardType}</p>
                </div>
              </div>
               <div className="flex items-center gap-4">
                <Waves className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Suggested Vibration</p>
                  <p className="text-lg font-semibold text-accent-foreground">{result.vibrationPattern}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
