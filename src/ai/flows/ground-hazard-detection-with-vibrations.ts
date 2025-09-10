'use server';
/**
 * @fileOverview Detects ground hazards using the phone's camera and alerts the user with distinct vibration patterns.
 *
 * - detectGroundHazard - A function that handles the ground hazard detection process.
 * - DetectGroundHazardInput - The input type for the detectGroundHazard function.
 * - DetectGroundHazardOutput - The return type for the detectGroundHazard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectGroundHazardInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the ground, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  proximityThreshold: z
    .number()
    .default(10)
    .describe('The distance threshold in inches to trigger a hazard alert.'),
});
export type DetectGroundHazardInput = z.infer<typeof DetectGroundHazardInputSchema>;

const DetectGroundHazardOutputSchema = z.object({
  hazardType: z
    .string()
    .describe('The type of ground hazard detected, such as step, uneven surface, or clear.'),
  vibrationPattern: z
    .string()
    .describe(
      'A description of the vibration pattern to use for the detected hazard.'
    ),
});
export type DetectGroundHazardOutput = z.infer<typeof DetectGroundHazardOutputSchema>;

export async function detectGroundHazard(
  input: DetectGroundHazardInput
): Promise<DetectGroundHazardOutput> {
  return detectGroundHazardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectGroundHazardPrompt',
  input: {schema: DetectGroundHazardInputSchema},
  output: {schema: DetectGroundHazardOutputSchema},
  prompt: `You are an AI assistant designed to identify ground hazards from images and recommend appropriate vibration patterns to alert users.

You will receive an image of the ground and should identify any potential hazards, such as steps, uneven surfaces, or obstacles.
Based on the identified hazard, you should suggest a distinct vibration pattern to alert the user. Different vibration patterns should be recommended for different hazard types to allow the user to distinguish between them.

Here are some example vibration patterns:
- Step: Short, rapid bursts
- Uneven surface: Continuous, low-intensity vibration
- Obstacle: Increasing intensity vibration based on proximity
- Clear: No vibration

Analyze the following image for ground hazards: {{media url=photoDataUri}}

Proximity Threshold: {{proximityThreshold}} inches

Based on the image, identify the hazard type and suggest a vibration pattern.
`,
});

const detectGroundHazardFlow = ai.defineFlow(
  {
    name: 'detectGroundHazardFlow',
    inputSchema: DetectGroundHazardInputSchema,
    outputSchema: DetectGroundHazardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
