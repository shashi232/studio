
"use client";

import { useState, useEffect, useContext } from 'react';
import { sendAlertsToContacts } from '@/ai/flows/automatic-fall-detection';
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
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [contacts] = useLocalStorage<EmergencyContact[]>('sos-contacts', []);
  const { toast } = useToast();
  const { isFallDetected, triggerFallAlert, dismissFallAlert } = useContext(AppContext);
  
  const handleSendAlerts = async () => {
    if (isSendingAlert) return;

    if (contacts.length === 0) {
        toast({
            title: "No SOS Contacts",
            description: "Please add at least one emergency contact in the 'SOS Contacts' tab before sending an alert.",
            variant: "destructive"
        });
        setIsSendingAlert(false);
        dismissFallAlert();
        setCountdown(COUNTDOWN_SECONDS);
        return;
    }
    
    setIsSendingAlert(true);

    try {
      const result = await sendAlertsToContacts({
        contacts: contacts,
      });

      if (result.overallSuccess) {
          const successTitle = "SOS Alert Sent";
          const successDesc = "Emergency contacts have been notified.";
          toast({ title: successTitle, description: successDesc });
      } else {
          const errorDesc = result.results.find(r => r.error)?.error || "Could not send alerts. Please check configuration and network.";
          toast({ title: "SOS Alert Failed", description: errorDesc, variant: "destructive"});
      }

    } catch (error) {
        console.error("Send alerts error:", error);
        toast({ title: "Error", description: "An unexpected error occurred while sending alerts.", variant: "destructive"});
    } finally {
        setIsSendingAlert(false);
        dismissFallAlert();
        setCountdown(COUNTDOWN_SECONDS);
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isFallDetected && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isFallDetected && countdown === 0) {
      handleSendAlerts();
    }
    return () => clearTimeout(timer);
  }, [isFallDetected, countdown]);


  const handleSimulateFall = () => {
    if (!isMonitoring) {
        toast({
            title: "Monitoring is off",
            description: "Please enable fall detection monitoring first.",
            variant: "destructive"
        });
        return;
    }
    toast({ title: "Simulated Fall Detected!" });
    triggerFallAlert();
  };

  const handleImOk = () => {
    dismissFallAlert();
    setCountdown(COUNTDOWN_SECONDS);
    toast({ title: "Alert Cancelled", description: "We're glad you're okay." });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Automatic Fall Detection</CardTitle>
          <CardDescription>Detects falls and automatically sends an SMS and/or WhatsApp alert.</CardDescription>
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
          <Button onClick={handleSimulateFall} disabled={!isMonitoring} className="w-full" size="lg">
            <Siren className="mr-2 h-5 w-5" />
            Simulate Fall
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
              Are you okay? An alert will be sent to your emergency contacts in...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="text-6xl font-bold tabular-nums text-destructive">{countdown}</div>
          </div>
          <AlertDialogFooter className="flex-col gap-2">
            <Button onClick={handleSendAlerts} variant="destructive" size="lg" className="w-full" disabled={isSendingAlert}>
              {isSendingAlert ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {isSendingAlert ? "Sending Alerts..." : "Send Alert Now"}
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
