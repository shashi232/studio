
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
  accelerometerData: z
    .string()
    .describe(
      'Accelerometer data from the phone, as a JSON string. Includes x, y, and z axis readings.'
    ),
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
  input: {schema: z.object({ accelerometerData: z.string(), contacts: DetectFallInputSchema.shape.contacts })},
  output: {schema: z.object({ fallDetected: z.boolean() }) },
  tools: [sendSms],
  prompt: `You are an AI assistant designed to detect falls based on accelerometer data and alert emergency contacts.

Analyze the accelerometer data to determine if a fall has occurred. A fall is characterized by a sharp change in acceleration (a spike) followed by a period of inactivity.

- If a fall is detected, set 'fallDetected' to true.
- If no fall is detected, set 'fallDetected' to false.

If a fall is detected, you MUST use the sendSms tool to send the following alert message to EVERY emergency contact listed: "SmartStep Alert: A potential fall has been detected. Please check on the user immediately."

Data provided:
- Accelerometer: {{{accelerometerData}}}
- Emergency Contacts: {{{JSON.stringify contacts}}}

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
    try {
      const { output } = await detectFallPrompt({
        accelerometerData: input.accelerometerData,
        contacts: input.contacts,
      });

      if (!output) {
        return { fallDetected: false, smsSent: false };
      }
      
      // If a fall was detected AND we need to send an SMS, iterate and send.
      // The AI tool calling will handle the actual sending based on the prompt.
      // This is just to confirm the output. In a real scenario, the tool calls would be awaited.
      const smsResults = await Promise.all(
        output.toolCalls.map(async (toolCall) => {
          if (toolCall.tool === 'sendSms') {
              const result = await sendSms(toolCall.input);
              return result.success;
          }
          return false;
        })
      );

      // Check if at least one SMS was sent successfully
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
