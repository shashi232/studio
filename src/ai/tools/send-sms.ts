
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Ensure environment variables are loaded
if (!process.env.ZIXFLOW_API_KEY || !process.env.ZIXFLOW_WID || !process.env.ZIXFLOW_PHONE_NUMBER) {
    console.warn("Zixflow environment variables are not fully set. SMS sending will fail.");
}

const zixflowApiKey = process.env.ZIXFLOW_API_KEY;
const zixflowWid = process.env.ZIXFLOW_WID;
const zixflowFromNumber = process.env.ZIXFLOW_PHONE_NUMBER;

const isConfigured = zixflowApiKey && zixflowWid && zixflowFromNumber;

export const sendSms = ai.defineTool(
    {
        name: 'sendSms',
        description: 'Sends an SMS message to a specified phone number using Zixflow.',
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
        if (!isConfigured) {
            const errorMsg = "Zixflow client is not initialized. Missing environment variables.";
            console.error(errorMsg);
            return { success: false, error: errorMsg };
        }
        
        const fetch = (await import('node-fetch')).default;

        try {
            const response = await fetch('https://api.zixflow.com/v1/sms/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${zixflowApiKey}`,
                },
                body: JSON.stringify({
                    wid: zixflowWid,
                    from: zixflowFromNumber,
                    to: input.to,
                    text: input.body,
                })
            });

            const responseData: any = await response.json();

            if (response.ok && responseData.status === 'success') {
                const messageId = responseData.data.id;
                console.log(`SMS sent successfully via Zixflow to ${input.to}. Message ID: ${messageId}`);
                return { success: true, message: `Message sent with ID: ${messageId}` };
            } else {
                const errorMessage = responseData.message || 'Unknown error from Zixflow API';
                console.error(`Failed to send SMS to ${input.to}:`, errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error: any) {
            console.error(`Failed to send SMS to ${input.to}:`, error);
            return { success: false, error: error.message };
        }
    }
);
