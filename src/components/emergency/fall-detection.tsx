"use client";

import { useState, useEffect } from 'react';
import { detectFallAndAlert } from '@/ai/flows/automatic-fall-detection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/lib/hooks/use-local-storage';
import type { EmergencyContact } from '@/lib/types';
import { Loader2, Siren } from 'lucide-react';

const COUNTDOWN_SECONDS = 15;

export default function FallDetection() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [fallDetected, setFallDetected] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts] = useLocalStorage<EmergencyContact[]>('sos-contacts', []);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (fallDetected && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (fallDetected && countdown === 0) {
      handleSendAlert();
      setFallDetected(false);
    }
    return () => clearTimeout(timer);
  }, [fallDetected, countdown]);

  const handleSimulateFall = async () => {
    if (!isMonitoring) {
        toast({
            title: "Monitoring is off",
            description: "Please enable fall detection monitoring first.",
            variant: "destructive"
        });
        return;
    }

    setIsLoading(true);
    try {
      const mockAccelerometerData = JSON.stringify({ x: 2.5, y: 1.2, z: 9.8 });
      const mockGpsLocation = JSON.stringify({ latitude: 34.0522, longitude: -118.2437 });
      
      const result = await detectFallAndAlert({
        accelerometerData: mockAccelerometerData,
        gpsLocation: mockGpsLocation,
        emergencyContacts: JSON.stringify(contacts),
      });

      if (result.fallDetected) {
        setCountdown(COUNTDOWN_SECONDS);
        setFallDetected(true);
      } else {
         toast({ title: "No Fall Detected", description: "The system did not detect a fall." });
      }
    } catch (error) {
        console.error("Fall detection error:", error);
        toast({ title: "Error", description: "Could not run fall detection.", variant: "destructive"});
    } finally {
        setIsLoading(false);
    }
  };

  const handleImOk = () => {
    setFallDetected(false);
    setCountdown(COUNTDOWN_SECONDS);
    toast({ title: "Alert Cancelled", description: "We're glad you're okay." });
  };

  const handleSendAlert = () => {
    toast({
      title: "SOS Alert Sent!",
      description: "Emergency contacts have been notified with your location.",
      variant: "destructive",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Automatic Fall Detection</CardTitle>
          <CardDescription>Detects falls and automatically sends an SOS.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="monitoring-switch" className="flex-grow">
              <h3 className="font-medium">Fall Monitoring</h3>
              <p className="text-xs text-muted-foreground">
                {isMonitoring ? 'Actively monitoring for falls.' : 'Monitoring is disabled.'}
              </p>
            </Label>
            <Switch
              id="monitoring-switch"
              checked={isMonitoring}
              onCheckedChange={setIsMonitoring}
              aria-label="Toggle fall monitoring"
            />
          </div>
          <Button onClick={handleSimulateFall} disabled={isLoading || !isMonitoring} className="w-full" size="lg">
            {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <Siren className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Analyzing...' : 'Simulate Fall'}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={fallDetected}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-3xl font-bold text-destructive">
              Fall Detected!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you okay? An alert will be sent to your emergency contacts in...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="text-6xl font-bold tabular-nums text-destructive">{countdown}</div>
          </div>
          <AlertDialogFooter>
            <Button onClick={handleImOk} size="lg" className="w-full">
              I&apos;m OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
