
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Ensure environment variables are loaded
if (!process.env.CLICKSEND_USERNAME || !process.env.CLICKSEND_API_KEY || !process.env.CLICKSEND_PHONE_NUMBER) {
    console.warn("Clicksend environment variables are not fully set. SMS sending will fail.");
}

const clicksendUsername = process.env.CLICKSEND_USERNAME;
const clicksendApiKey = process.env.CLICKSEND_API_KEY;
const clicksendFromNumber = process.env.CLICKSEND_PHONE_NUMBER;

const isConfigured = clicksendUsername && clicksendApiKey && clicksendFromNumber;

export const sendSms = ai.defineTool(
    {
        name: 'sendSms',
        description: 'Sends an SMS message to a specified phone number using Clicksend.',
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
            const errorMsg = "Clicksend client is not initialized. Missing environment variables.";
            console.error(errorMsg);
            return { success: false, error: errorMsg };
        }
        
        const auth = Buffer.from(`${clicksendUsername}:${clicksendApiKey}`).toString('base64');
        const fetch = (await import('node-fetch')).default;

        try {
            const response = await fetch('https://rest.clicksend.com/v3/sms/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`,
                },
                body: JSON.stringify({
                    messages: [
                        {
                            source: 'sdk',
                            from: clicksendFromNumber,
                            to: input.to,
                            body: input.body,
                        }
                    ]
                })
            });

            const responseData: any = await response.json();

            if (response.ok && responseData.http_code === 200) {
                const messageId = responseData.data.messages[0].message_id;
                console.log(`SMS sent successfully to ${input.to}. Message ID: ${messageId}`);
                return { success: true, message: `Message sent with ID: ${messageId}` };
            } else {
                const errorMessage = responseData.response_msg || 'Unknown error from Clicksend API';
                console.error(`Failed to send SMS to ${input.to}:`, errorMessage);
                return { success: false, error: errorMessage };
            }
        } catch (error: any) {
            console.error(`Failed to send SMS to ${input.to}:`, error);
            return { success: false, error: error.message };
        }
    }
);
