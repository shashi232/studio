
'use server';

/**
 * @fileOverview A simplified, direct function for sending fall detection alerts.
 */

import { sendSms } from '@/ai/tools/send-sms';
import type { EmergencyContact } from '@/lib/types';
import { z } from 'zod';

// Define the input schema for the direct alert function
export const AlertContactsInputSchema = z.object({
  contacts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string(),
  })).describe('An array of emergency contacts to notify.'),
});
export type AlertContactsInput = z.infer<typeof AlertContactsInputSchema>;

// Define the output schema
export const AlertContactsOutputSchema = z.object({
  overallSuccess: z.boolean().describe('Whether sending alerts was successful to at least one contact.'),
  results: z.array(z.object({
    contact: z.object({ name: z.string(), phone: z.string() }),
    success: z.boolean(),
    error: z.string().optional(),
  })).describe('The result of the alert for each contact.')
});
export type AlertContactsOutput = z.infer<typeof AlertContactsOutputSchema>;

/**
 * Sends alerts to a list of emergency contacts via SMS and/or WhatsApp.
 * This is a direct application function, not an AI flow, for maximum reliability.
 * @param input The list of contacts to alert.
 * @returns A promise that resolves with the results of the send operations.
 */
export async function sendAlertsToContacts(
  input: AlertContactsInput
): Promise<AlertContactsOutput> {
  const alertMessage = "SmartStep Alert: A potential fall has been detected. Please check on the user immediately.";

  const alertPromises = input.contacts.map(async (contact) => {
    const result = await sendSms({
      to: contact.phone,
      body: alertMessage,
    });
    return {
      contact: { name: contact.name, phone: contact.phone },
      success: result.success,
      error: result.error,
    };
  });

  try {
    const results = await Promise.all(alertPromises);
    const overallSuccess = results.some(r => r.success);

    if (!overallSuccess) {
      console.error("Failed to send alert to any contact.", results);
    } else {
        console.log("Successfully sent alerts to one or more contacts.", results);
    }

    return { overallSuccess, results };
  } catch (error) {
    console.error("An unexpected error occurred while sending alerts:", error);
    return {
      overallSuccess: false,
      results: input.contacts.map(c => ({
          contact: { name: c.name, phone: c.phone },
          success: false,
          error: error instanceof Error ? error.message : "An unknown error occurred."
      })),
    };
  }
}
