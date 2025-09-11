'use server';

/**
 * @fileOverview A flow for detecting falls, optionally using Twilio to send SMS alerts.
 *
 * - detectFallAndAlert - A function that handles the fall detection and alerting process.
 * - DetectFallAndAlertInput - The input type for the detectFallAndAlert function.
 * - DetectFallAndAlertOutput - The return type for the detectFallAndAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import twilio from 'twilio';

// Define the schema for a single emergency contact
const EmergencyContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
});

// Define the input schema for the flow
const DetectFallAndAlertInputSchema = z.object({
  accelerometerData: z
    .string()
    .describe(
      'Accelerometer data from the phone, as a JSON string. Includes x, y, and z axis readings.'
    ),
  gpsLocation: z
    .string()
    .describe(
      'The GPS location of the phone, as a JSON string with latitude and longitude fields.'
    ),
  emergencyContacts: z
    .array(EmergencyContactSchema)
    .describe('A list of emergency contacts.'),
  sendSms: z.boolean().describe('Whether to send an SMS to emergency contacts.'),
});
export type DetectFallAndAlertInput = z.infer<
  typeof DetectFallAndAlertInputSchema
>;

// Define the output schema for the flow
const DetectFallAndAlertOutputSchema = z.object({
  fallDetected: z.boolean().describe('Whether a fall was detected or not.'),
  alertSent: z
    .boolean()
    .describe('Whether an alert was sent to emergency contacts.'),
  confirmationNeeded: z
    .boolean()
    .describe('Whether the user needs to confirm they are OK.'),
  sosMessage: z.string().optional().describe('The generated SOS message content.'),
});
export type DetectFallAndAlertOutput = z.infer<
  typeof DetectFallAndAlertOutputSchema
>;

// Define the Twilio SMS sending tool
const sendSms = ai.defineTool(
  {
    name: 'sendSms',
    description: 'Sends an SMS message to a specified phone number.',
    inputSchema: z.object({
      to: z.string().describe('The destination phone number for the SMS in E.164 format.'),
      body: z.string().describe('The content of the SMS message.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      messageSid: z.string().optional(),
    }),
  },
  async input => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('Twilio credentials are not set in environment variables.');
      return {success: false};
    }

    try {
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({
        body: input.body,
        from: twilioPhoneNumber,
        to: input.to,
      });
      console.log(`SMS sent successfully to ${input.to}. SID: ${message.sid}`);
      return {success: true, messageSid: message.sid};
    } catch (error: any) {
      console.error(`Failed to send SMS to ${input.to}:`, error.message);
      return {success: false};
    }
  }
);

// Define a new input schema for the prompt that includes the stringified contacts
const PromptInputSchema = DetectFallAndAlertInputSchema.extend({
    stringifiedEmergencyContacts: z.string().describe('A JSON string of the emergency contacts list.'),
});

// Define the main prompt for the AI
const prompt = ai.definePrompt({
  name: 'detectFallAndAlertPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: DetectFallAndAlertOutputSchema},
  tools: [sendSms],
  prompt: `You are an AI assistant designed to detect falls and send emergency alerts.

Analyze the accelerometer data to determine if a fall has occurred. A fall is characterized by a sharp change in acceleration followed by a period of inactivity.

- If a fall is detected:
  - Set 'fallDetected' to true.
  - Set 'confirmationNeeded' to true.
  - If 'sendSms' is true:
    - Construct a clear and urgent SOS message. The message MUST start with "SmartStep Alert: A fall has been detected for the user." and include their location based on this GPS data: {{{gpsLocation}}}.
    - For EACH contact in the provided list, you MUST use the 'sendSms' tool to send the generated SOS message to their phone number.
    - Here is the list of contacts: {{{stringifiedEmergencyContacts}}}.
    - After successfully calling the tool for all contacts, set 'alertSent' to true.
  - If 'sendSms' is false, do not send any messages.

- If no fall is detected:
  - Set 'fallDetected' to false.
  - Set 'confirmationNeeded' to false.
  - Set 'alertSent' to false.

Data provided:
- Accelerometer: {{{accelerometerData}}}
- GPS Location: {{{gpsLocation}}}

Produce the output in the required JSON format.
`,
});

// Define the flow that orchestrates the process
const detectFallAndAlertFlow = ai.defineFlow(
  {
    name: 'detectFallAndAlertFlow',
    inputSchema: DetectFallAndAlertInputSchema,
    outputSchema: DetectFallAndAlertOutputSchema,
  },
  async input => {
    // Stringify the contacts before sending to the prompt
    const stringifiedEmergencyContacts = JSON.stringify(input.emergencyContacts);
    const promptInput = { ...input, stringifiedEmergencyContacts };

    const {output} = await prompt(promptInput);
    return output!;
  }
);

// Exported function to be called from the frontend
export async function detectFallAndAlert(
  input: DetectFallAndAlertInput
): Promise<DetectFallAndAlertOutput> {
  return detectFallAndAlertFlow(input);
}
