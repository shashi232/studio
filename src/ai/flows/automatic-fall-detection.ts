
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
});
export type DetectFallAndAlertOutput = z.infer<
  typeof DetectFallAndAlertOutputSchema
>;

// Define the Twilio SMS sending tool
const sendSmsTool = ai.defineTool(
  {
    name: 'sendSmsTool',
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

const FallDetectionOnlySchema = z.object({
  fallDetected: z.boolean().describe('Whether a fall was detected or not.'),
});

// Define the main prompt for the AI - SIMPLIFIED to only detect a fall
const detectFallPrompt = ai.definePrompt({
  name: 'detectFallPrompt',
  input: {schema: z.object({ accelerometerData: z.string() })},
  output: {schema: FallDetectionOnlySchema},
  prompt: `You are an AI assistant designed to detect falls based on accelerometer data.

Analyze the accelerometer data to determine if a fall has occurred. A fall is characterized by a sharp change in acceleration (a spike) followed by a period of inactivity.

- If a fall is detected, set 'fallDetected' to true.
- If no fall is detected, set 'fallDetected' to false.

Data provided:
- Accelerometer: {{{accelerometerData}}}

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
    let fallDetectionResult;
    try {
      // Step 1: Ask the AI to ONLY detect the fall.
      const {output} = await detectFallPrompt({
        accelerometerData: input.accelerometerData,
      });
      fallDetectionResult = output;

    } catch (error) {
        console.error("AI Fall Detection Error:", error);
        // If the AI service fails, we assume no fall for safety.
        return { fallDetected: false, alertSent: false, confirmationNeeded: false };
    }


    if (!fallDetectionResult) {
      // If AI fails to respond, assume no fall for safety.
      return { fallDetected: false, alertSent: false, confirmationNeeded: false };
    }

    const isFallDetected = fallDetectionResult.fallDetected;

    // If no fall is detected, we are done.
    if (!isFallDetected) {
      return { fallDetected: false, alertSent: false, confirmationNeeded: false };
    }

    // If a fall IS detected, but we are not supposed to send an SMS yet,
    // just report that confirmation is needed.
    if (!input.sendSms) {
      return { fallDetected: true, alertSent: false, confirmationNeeded: true };
    }

    // Step 2: If we are here, a fall was detected AND we need to send an SMS.
    // The application code will now handle sending the messages.
    let anyAlertSent = false;
    
    // Create the message content.
    const sosMessage = `SmartStep Alert: A fall has been detected for the user.`;

    // Loop through contacts and send SMS for each one.
    for (const contact of input.emergencyContacts) {
        console.log(`Attempting to send SMS to ${contact.name} at ${contact.phone}`);
        const result = await sendSmsTool({
            to: contact.phone,
            body: sosMessage,
        });
        if (result.success) {
            anyAlertSent = true;
        }
    }
    
    return { fallDetected: true, alertSent: anyAlertSent, confirmationNeeded: false };
  }
);

// Exported function to be called from the frontend
export async function detectFallAndAlert(
  input: DetectFallAndAlertInput
): Promise<DetectFallAndAlertOutput> {
  return detectFallAndAlertFlow(input);
}
