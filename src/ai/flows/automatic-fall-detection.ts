
'use server';

/**
 * @fileOverview A flow for detecting falls and alerting emergency contacts.
 *
 * - detectFall - A function that handles the fall detection and alerting process.
 * - DetectFallInput - The input type for the detectFall function.
 * - DetectFallOutput - The return type for the detectFall function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendSms } from '@/ai/tools/send-sms';
import type { EmergencyContact } from '@/lib/types';


// Define the input schema for the flow
const DetectFallInputSchema = z.object({
  fallOccurred: z.boolean().describe("A boolean indicating if a fall has occurred."),
  sendSms: z.boolean().describe('Whether to send an SMS alert if a fall is detected.'),
  contacts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
  })).describe('An array of emergency contacts to notify.'),
});
export type DetectFallInput = z.infer<
  typeof DetectFallInputSchema
>;

// Define the output schema for the flow
const DetectFallOutputSchema = z.object({
  fallDetected: z.boolean().describe('Whether a fall was detected or not.'),
  smsSent: z.boolean().describe('Whether an SMS alert was successfully sent.'),
});
export type DetectFallOutput = z.infer<
  typeof DetectFallOutputSchema
>;

// Define the main prompt for the AI - This prompt's ONLY job is to confirm a fall.
const detectFallPrompt = ai.definePrompt({
  name: 'detectFallPrompt',
  input: {schema: z.object({ fallOccurred: z.boolean() })},
  output: {schema: z.object({ fallDetected: z.boolean() }) },
  prompt: `You are an AI assistant that confirms if a fall has occurred.
You have been given a boolean 'fallOccurred'.
If 'fallOccurred' is true, set the 'fallDetected' output field to true.
If 'fallOccurred' is false, set 'fallDetected' to false.

- Fall Occurred: {{{fallOccurred}}}

Produce the output in the required JSON format.
`,
});

// Define the flow that orchestrates the process
const detectFallAndAlertFlow = ai.defineFlow(
  {
    name: 'detectFallAndAlertFlow',
    inputSchema: DetectFallInputSchema,
    outputSchema: DetectFallOutputSchema,
  },
  async (input) => {
    // If no fall occurred, exit early.
    if (!input.fallOccurred) {
        return { fallDetected: false, smsSent: false };
    }

    try {
      // Step 1: Have the AI simply confirm the fall occurred.
      const { output } = await detectFallPrompt({
        fallOccurred: input.fallOccurred,
      });

      if (!output?.fallDetected) {
        return { fallDetected: false, smsSent: false };
      }

      // Step 2: If we are not supposed to send an SMS, exit here.
      if (!input.sendSms) {
          return { fallDetected: true, smsSent: false };
      }

      // Step 3: Application code takes control. Loop through contacts and send SMS.
      const alertMessage = "SmartStep Alert: A potential fall has been detected. Please check on the user immediately.";
      let smsSentSuccessfully = false;
      
      const smsPromises = input.contacts.map(contact => 
        sendSms({
          to: contact.phone,
          body: alertMessage,
        })
      );

      const results = await Promise.all(smsPromises);

      // Check if at least one SMS was sent successfully.
      smsSentSuccessfully = results.some(result => result.success);

      if (!smsSentSuccessfully) {
        console.error("Failed to send SMS to any contact.");
      }

      return { fallDetected: true, smsSent: smsSentSuccessfully };

    } catch (error) {
        console.error("AI Fall Detection/Alert Flow Error:", error);
        return { fallDetected: false, smsSent: false };
    }
  }
);


// Exported function to be called from the frontend
export async function detectFall(
  input: DetectFallInput
): Promise<DetectFallOutput> {
  return detectFallAndAlertFlow(input);
}
