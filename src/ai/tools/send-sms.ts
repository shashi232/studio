
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Twilio from 'twilio';

export const sendSms = ai.defineTool(
    {
        name: 'sendSms',
        description: 'Sends an SMS message and a WhatsApp message to a specified phone number using Twilio.',
        inputSchema: z.object({
            to: z.string().describe('The E.164 format phone number to send the message to.'),
            body: z.string().describe('The content of the message.'),
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
        const fromSmsNumber = process.env.TWILIO_PHONE_NUMBER;
        const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
        
        if (!accountSid || !authToken || !fromSmsNumber) {
            const errorMsg = "Twilio client for SMS is not initialized. Missing environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER).";
            console.error(errorMsg);
            return { success: false, error: errorMsg };
        }
        
        const client = Twilio(accountSid, authToken);
        let smsSuccess = false;
        let whatsappSuccess = false;
        let smsError: string | undefined;
        let whatsappError: string | undefined;

        // Send SMS
        try {
            const message = await client.messages.create({
                body: input.body,
                from: fromSmsNumber,
                to: input.to,
            });
            console.log(`SMS sent successfully to ${input.to}. SID: ${message.sid}`);
            smsSuccess = true;
        } catch (error: any) {
            console.error(`Failed to send SMS to ${input.to}:`, error);
            smsError = error.message;
        }

        // Send WhatsApp message if configured
        if (fromWhatsAppNumber) {
            try {
                const whatsappMessage = await client.messages.create({
                    body: input.body,
                    from: fromWhatsAppNumber, // e.g., 'whatsapp:+14155238886'
                    to: `whatsapp:${input.to}`,
                });
                console.log(`WhatsApp message sent successfully to ${input.to}. SID: ${whatsappMessage.sid}`);
                whatsappSuccess = true;
            } catch (error: any) {
                console.error(`Failed to send WhatsApp message to ${input.to}:`, error);
                whatsappError = error.message;
            }
        } else {
            console.log("TWILIO_WHATSAPP_NUMBER not configured. Skipping WhatsApp message.");
            // If we don't intend to send a WhatsApp message, we can consider it a "success" for the overall operation.
            whatsappSuccess = true; 
        }

        const overallSuccess = smsSuccess && whatsappSuccess;
        let combinedMessage = "";
        if (smsSuccess) combinedMessage += "SMS sent. ";
        if (whatsappSuccess && fromWhatsAppNumber) combinedMessage += "WhatsApp message sent.";

        let combinedError = "";
        if (smsError) combinedError += `SMS Error: ${smsError}. `;
        if (whatsappError) combinedError += `WhatsApp Error: ${whatsappError}.`;

        return { 
            success: overallSuccess, 
            message: combinedMessage.trim(),
            error: combinedError.trim() || undefined
        };
    }
);
