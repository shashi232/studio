
'use server';

/**
 * @fileOverview A flow for detecting falls.
 *
 * - detectFall - A function that handles the fall detection process.
 * - DetectFallInput - The input type for the detectFall function.
 * - DetectFallOutput - The return type for the detectFall function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


// Define the input schema for the flow
const DetectFallInputSchema = z.object({
  accelerometerData: z
    .string()
    .describe(
      'Accelerometer data from the phone, as a JSON string. Includes x, y, and z axis readings.'
    ),
});
export type DetectFallInput = z.infer<
  typeof DetectFallInputSchema
>;

// Define the output schema for the flow
const DetectFallOutputSchema = z.object({
  fallDetected: z.boolean().describe('Whether a fall was detected or not.'),
});
export type DetectFallOutput = z.infer<
  typeof DetectFallOutputSchema
>;

// Define the main prompt for the AI - SIMPLIFIED to only detect a fall
const detectFallPrompt = ai.definePrompt({
  name: 'detectFallPrompt',
  input: {schema: z.object({ accelerometerData: z.string() })},
  output: {schema: DetectFallOutputSchema},
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
const detectFallFlow = ai.defineFlow(
  {
    name: 'detectFallFlow',
    inputSchema: DetectFallInputSchema,
    outputSchema: DetectFallOutputSchema,
  },
  async input => {
    try {
      // Ask the AI to ONLY detect the fall.
      const {output} = await detectFallPrompt({
        accelerometerData: input.accelerometerData,
      });

      if (!output) {
        // If AI fails to respond, assume no fall for safety.
         return { fallDetected: false };
      }
      return { fallDetected: output.fallDetected };

    } catch (error) {
        console.error("AI Fall Detection Error:", error);
        // If the AI service fails, we assume no fall for safety.
        return { fallDetected: false };
    }
  }
);

// Exported function to be called from the frontend
export async function detectFall(
  input: DetectFallInput
): Promise<DetectFallOutput> {
  return detectFallFlow(input);
}
