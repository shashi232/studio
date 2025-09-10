"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ArrowUp, Navigation, StopCircle } from 'lucide-react';

type Instruction = {
  text: string;
  icon: React.ReactNode;
};

const route: Instruction[] = [
  { text: 'Proceed straight for 200m', icon: <ArrowUp className="h-16 w-16" /> },
  { text: 'Turn left in 50m', icon: <ArrowLeft className="h-16 w-16" /> },
  { text: 'Continue for 100m', icon: <ArrowUp className="h-16 w-16" /> },
  { text: 'Turn right at the intersection', icon: <ArrowRight className="h-16 w-16" /> },
  { text: 'You have arrived at your destination', icon: <Navigation className="h-16 w-16 text-green-500" /> },
];

export default function NavigationPage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startNavigation = () => {
    setCurrentStep(0);
    setIsNavigating(true);
  };

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isNavigating) {
      interval = setInterval(() => {
        setCurrentStep((prevStep) => {
          if (prevStep < route.length - 1) {
            return prevStep + 1;
          }
          stopNavigation();
          return prevStep;
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isNavigating, stopNavigation]);
  
  const currentInstruction = isNavigating ? route[currentStep] : { text: "Start a trip to get directions.", icon: <Navigation className="h-16 w-16" /> };

  return (
    <div className="container mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-3xl font-bold text-primary">Haptic Navigation</h1>
        <p className="text-muted-foreground">Vibrational cues to guide your way.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Route</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
            <Map className="h-24 w-24 text-muted-foreground/50" />
            <p className="sr-only">A mock map view of the current location</p>
          </div>
          <Card className="bg-accent/50 text-center">
            <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
                <div className="text-primary">{currentInstruction.icon}</div>
                <p className="text-xl font-semibold text-accent-foreground">{currentInstruction.text}</p>
            </CardContent>
          </Card>
           <Button
            size="lg"
            className="w-full"
            onClick={isNavigating ? stopNavigation : startNavigation}
          >
            {isNavigating ? <StopCircle className="mr-2 h-5 w-5" /> : <Navigation className="mr-2 h-5 w-5" />}
            {isNavigating ? 'Stop Trip' : 'Start Trip'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
