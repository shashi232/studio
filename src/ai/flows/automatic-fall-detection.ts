
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

// Define the main prompt for the AI
const detectFallPrompt = ai.definePrompt({
  name: 'detectFallPrompt',
  input: {schema: z.object({ fallOccurred: z.boolean(), contacts: DetectFallInputSchema.shape.contacts })},
  output: {schema: z.object({ fallDetected: z.boolean() }) },
  tools: [sendSms],
  prompt: `You are an AI assistant designed to alert emergency contacts when a fall is detected.

You have been given a boolean 'fallOccurred' which is definitively TRUE if a fall happened.

If 'fallOccurred' is true, you MUST use the sendSms tool to send the following alert message to EVERY emergency contact listed: "SmartStep Alert: A potential fall has been detected. Please check on the user immediately."

Set the 'fallDetected' output field to true.

If 'fallOccurred' is false, do nothing and set 'fallDetected' to false.

- Emergency Contacts: {{{JSON.stringify contacts}}}
- Fall Occurred: {{{fallOccurred}}}

Produce the output in the required JSON format. Then, if a fall was detected, call the necessary tools.
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
    // If no fall occurred or we are not supposed to send an SMS, exit early.
    if (!input.fallOccurred || !input.sendSms) {
        return { fallDetected: input.fallOccurred, smsSent: false };
    }

    try {
      const { output } = await detectFallPrompt({
        fallOccurred: input.fallOccurred,
        contacts: input.contacts,
      });

      if (!output) {
        return { fallDetected: false, smsSent: false };
      }
      
      const smsResults = await Promise.all(
        output.toolCalls.map(async (toolCall) => {
          if (toolCall.tool === 'sendSms') {
              const result = await sendSms(toolCall.input);
              return result.success;
          }
          return false;
        })
      );

      const smsSentSuccessfully = smsResults.some(success => success);

      return { fallDetected: output.fallDetected, smsSent: smsSentSuccessfully };

    } catch (error) {
        console.error("AI Fall Detection/Alert Error:", error);
        // If the AI service fails, we assume no fall and no SMS sent for safety.
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
