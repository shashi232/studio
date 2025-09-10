'use server';

/**
 * @fileOverview A flow for detecting falls using the phone's sensors and triggering an alert.
 *
 * - detectFallAndAlert - A function that handles the fall detection and alerting process.
 * - DetectFallAndAlertInput - The input type for the detectFallAndAlert function.
 * - DetectFallAndAlertOutput - The return type for the detectFallAndAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectFallAndAlertInputSchema = z.object({
  accelerometerData: z
    .string()
    .describe(
      'Accelerometer data from the phone, as a JSON string.  Includes x, y, and z axis readings.'
    ),
  gpsLocation: z
    .string()
    .describe(
      'The GPS location of the phone, as a JSON string with latitude and longitude fields.'
    ),
  emergencyContacts: z
    .string()
    .describe(
      'A list of emergency contacts, as a JSON string, with name and phone number for each contact.'
    ),
});
export type DetectFallAndAlertInput = z.infer<typeof DetectFallAndAlertInputSchema>;

const DetectFallAndAlertOutputSchema = z.object({
  fallDetected: z.boolean().describe('Whether a fall was detected or not.'),
  alertSent: z.boolean().describe('Whether an alert was sent to emergency contacts.'),
  locationSent: z.boolean().describe('Whether the GPS location was sent.'),
  confirmationNeeded: z
    .boolean()
    .describe('Whether the user needs to confirm they are OK.'),
  sosMessage: z.string().describe('SOS message content.'),
});
export type DetectFallAndAlertOutput = z.infer<typeof DetectFallAndAlertOutputSchema>;

export async function detectFallAndAlert(
  input: DetectFallAndAlertInput
): Promise<DetectFallAndAlertOutput> {
  return detectFallAndAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectFallAndAlertPrompt',
  input: {schema: DetectFallAndAlertInputSchema},
  output: {schema: DetectFallAndAlertOutputSchema},
  prompt: `You are an AI assistant that helps detect falls and send alerts.

You will receive accelerometer data, GPS location, and a list of emergency contacts.
Your task is to analyze the accelerometer data to determine if a fall has occurred.
If a fall is detected, you should:
1. Set fallDetected to true.
2. Determine if user confirmation is needed.
3. Construct an SOS message containing the user's location.
4. Set the alertSent flag to indicate that an alert should be sent if the user does not respond.
5. Set locationSent flag to true if you include the location in the alert.

Here is the accelerometer data: {{{accelerometerData}}}
Here is the GPS location: {{{gpsLocation}}}
Here are the emergency contacts: {{{emergencyContacts}}}

Consider a fall to be detected if there is a sudden change in acceleration followed by a period of no movement.
If a fall is detected, set confirmationNeeded to true. The app should display a message asking the user if they are OK.
If the user does not respond within a specified time, the app should send an SOS message to the emergency contacts with the user's location.
Set alertSent to true to indicate that an alert should be sent if there is no response from user.

Output in JSON format.
`,
});

const detectFallAndAlertFlow = ai.defineFlow(
  {
    name: 'detectFallAndAlertFlow',
    inputSchema: DetectFallAndAlertInputSchema,
    outputSchema: DetectFallAndAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
