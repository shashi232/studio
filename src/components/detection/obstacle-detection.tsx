"use client";

import { useState } from 'react';
import Image from 'next/image';
import { obstacleAlert, type ObstacleAlertOutput } from '@/ai/flows/obstacle-alerts-from-camera';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, ScanLine } from 'lucide-react';

const obstacleImage = PlaceHolderImages.find(img => img.id === 'obstacle-1');

// Helper to convert image URL to data URI
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

export default function ObstacleDetection() {
  const [proximity, setProximity] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ObstacleAlertOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!obstacleImage) {
      setError("Placeholder image not found.");
      return;
    }
    
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const dataUri = await toDataURL(obstacleImage.imageUrl);
      const res = await obstacleAlert({
        photoDataUri: dataUri,
        proximityThreshold: proximity,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
      setError("Failed to process image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertBadgeVariant = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      default:
        return 'default';
    }
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'HIGH':
      case 'MEDIUM':
      case 'LOW':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      case 'NONE':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forward Obstacle Alert</CardTitle>
        <CardDescription>Detects obstacles in your path using the camera.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {obstacleImage && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={obstacleImage.imageUrl}
              alt={obstacleImage.description}
              fill
              className="object-cover"
              data-ai-hint={obstacleImage.imageHint}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="proximity">Proximity Threshold: {proximity}m</Label>
          <Slider
            id="proximity"
            min={1}
            max={10}
            step={1}
            value={[proximity]}
            onValueChange={(value) => setProximity(value[0])}
            disabled={isLoading}
          />
        </div>

        <Button onClick={handleScan} disabled={isLoading} className="w-full" size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <ScanLine className="mr-2 h-5 w-5" />
          )}
          {isLoading ? 'Scanning...' : 'Scan for Obstacles'}
        </Button>

        {result && (
          <Card className="bg-accent/50">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
               {getAlertIcon(result.alertLevel)}
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  Alert Level: 
                  <Badge variant={getAlertBadgeVariant(result.alertLevel)} className="text-sm">
                    {result.alertLevel}
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-accent-foreground">{result.obstacleDescription}</p>
            </CardContent>
          </Card>
        )}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
