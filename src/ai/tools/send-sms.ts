
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Twilio from 'twilio';

export const sendSms = ai.defineTool(
    {
        name: 'sendSms',
        description: 'Sends an SMS message to a specified phone number using Twilio.',
        inputSchema: z.object({
            to: z.string().describe('The E.164 format phone number to send the SMS to.'),
            body: z.string().describe('The content of the SMS message.'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            message: z.string().optional(),
            error: z.string().optional(),
        }),
    },
    async (input) => {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;
        
        if (!accountSid || !authToken || !fromNumber) {
            const errorMsg = "Twilio client is not initialized. Missing environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER).";
            console.error(errorMsg);
            return { success: false, error: errorMsg };
        }
        
        const client = Twilio(accountSid, authToken);

        try {
            const message = await client.messages.create({
                body: input.body,
                from: fromNumber,
                to: input.to,
            });
            console.log(`SMS sent successfully to ${input.to}. SID: ${message.sid}`);
            return { success: true, message: `Message sent with SID: ${message.sid}` };
        } catch (error: any) {
            console.error(`Failed to send SMS to ${input.to}:`, error);
            return { success: false, error: error.message };
        }
    }
);
