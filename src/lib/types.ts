import { z } from 'zod';

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
};

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