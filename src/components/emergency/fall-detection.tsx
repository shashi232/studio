
"use client";

import { useState, useEffect, useContext } from 'react';
import { detectFallAndAlert } from '@/ai/flows/automatic-fall-detection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
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
import { AppContext } from '@/context/app-context';

const COUNTDOWN_SECONDS = 15;

export default function FallDetection() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false); // New state to prevent double sends
  const [contacts] = useLocalStorage<EmergencyContact[]>('sos-contacts', []);
  const { toast } = useToast();
  const { isFallDetected, triggerFallAlert, dismissFallAlert } = useContext(AppContext);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isFallDetected && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isFallDetected && countdown === 0) {
      handleSendAlert();
    }
    return () => clearTimeout(timer);
  }, [isFallDetected, countdown]);

  const runFallDetection = async (sendSms: boolean) => {
    if (!isMonitoring && !sendSms) {
        toast({
            title: "Monitoring is off",
            description: "Please enable fall detection monitoring first.",
            variant: "destructive"
        });
        return;
    }
    if (contacts.length === 0) {
        toast({
            title: "No SOS Contacts",
            description: "Please add at least one emergency contact in the 'SOS Contacts' tab.",
            variant: "destructive"
        });
        return;
    }
    
    setIsLoading(true);
    if (sendSms) {
      setIsSendingAlert(true);
    }

    try {
      // These are mock values for demonstration. In a real app, you'd get these from device sensors.
      const mockAccelerometerData = JSON.stringify({ x: 2.5, y: 1.2, z: 9.8, freefall: true });
      const mockGpsLocation = JSON.stringify({ latitude: 34.0522, longitude: -118.2437 });
      
      const result = await detectFallAndAlert({
        accelerometerData: mockAccelerometerData,
        gpsLocation: mockGpsLocation,
        emergencyContacts: contacts,
        sendSms: sendSms,
      });

      if (result.fallDetected && !sendSms) {
        triggerFallAlert(); // This will show the "Are you OK?" dialog
        toast({ title: "Simulated Fall Detected!" });
      } else if (result.alertSent) {
        toast({
          title: "SOS Alert Sent!",
          description: "Emergency contacts have been notified via SMS.",
          variant: "destructive",
        });
      } else if (!result.fallDetected) {
         toast({ title: "No Fall Detected", description: "The system did not detect a fall." });
      } else if (sendSms && !result.alertSent) {
        toast({ title: "SMS Failed", description: "The alert could not be sent. Please check your settings.", variant: "destructive" });
      }

    } catch (error) {
        console.error("Fall detection error:", error);
        toast({ title: "Error", description: "Could not run fall detection.", variant: "destructive"});
    } finally {
        setIsLoading(false);
        // Reset state after alert is sent or cancelled
        if (sendSms || !isFallDetected) {
          dismissFallAlert();
          setCountdown(COUNTDOWN_SECONDS);
          setIsSendingAlert(false);
        }
    }
  }

  const handleSimulateFall = () => {
    runFallDetection(false); // Don't send SMS yet, just trigger the dialog
  };

  const handleImOk = () => {
    dismissFallAlert();
    setCountdown(COUNTDOWN_SECONDS);
    setIsSendingAlert(false);
    toast({ title: "Alert Cancelled", description: "We're glad you're okay." });
  };

  const handleSendAlert = () => {
    if (isSendingAlert) return; // Prevent multiple calls
    // Now we call the flow again, but instruct it to send the SMS
    runFallDetection(true); 
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Automatic Fall Detection</CardTitle>
          <CardDescription>Detects falls and automatically sends an SMS alert.</CardDescription>
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
            {(isLoading && !isSendingAlert) ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <Siren className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Analyzing...' : 'Simulate Fall'}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={isFallDetected}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-3xl font-bold text-destructive">
              Fall Detected!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you okay? An SMS alert will be sent to your emergency contacts in...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="text-6xl font-bold tabular-nums text-destructive">{countdown}</div>
          </div>
          <AlertDialogFooter className="flex-col gap-2">
            <Button onClick={handleSendAlert} variant="destructive" size="lg" className="w-full" disabled={isSendingAlert}>
              {isSendingAlert ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isSendingAlert ? "Sending..." : "Send Alert Now"}
            </Button>
            <Button onClick={handleImOk} variant="outline" size="lg" className="w-full" disabled={isSendingAlert}>
              I&apos;m OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
