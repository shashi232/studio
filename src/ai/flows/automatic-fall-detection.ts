
'use server';

/**
 * @fileOverview A simplified, direct function for sending fall detection alerts.
 */

import { sendSms } from '@/ai/tools/send-sms';
import type { AlertContactsInput, AlertContactsOutput } from '@/lib/types';

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
