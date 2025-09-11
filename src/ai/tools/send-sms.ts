
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import twilio from 'twilio';

// Ensure environment variables are loaded
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn("Twilio environment variables are not fully set. SMS sending will fail.");
}

const twilioClient = process.env.TWILIO_ACCOUNT_SID ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

export const sendSms = ai.defineTool(
    {
        name: 'sendSms',
        description: 'Sends an SMS message to a specified phone number.',
        inputSchema: z.object({
            to: z.string().describe('The E.164 format phone number to send the SMS to.'),
            body: z.string().describe('The content of the SMS message.'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            messageSid: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input) => {
        if (!twilioClient) {
            const errorMsg = "Twilio client is not initialized. Missing environment variables.";
            console.error(errorMsg);
            return { success: false, error: errorMsg };
        }
        
        try {
            const message = await twilioClient.messages.create({
                body: input.body,
                from: process.env.TWILIO_PHONE_NUMBER!,
                to: input.to,
            });
            console.log(`SMS sent successfully to ${input.to}. SID: ${message.sid}`);
            return { success: true, messageSid: message.sid };
        } catch (error: any) {
            console.error(`Failed to send SMS to ${input.to}:`, error);
            return { success: false, error: error.message };
        }
    }
);
