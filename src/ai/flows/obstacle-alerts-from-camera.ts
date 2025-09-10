'use server';
/**
 * @fileOverview Obstacle detection using the phone's camera and alerting the user with vibrations.
 *
 * - obstacleAlert - A function that processes camera input to detect obstacles and returns alert levels.
 * - ObstacleAlertInput - The input type for the obstacleAlert function.
 * - ObstacleAlertOutput - The return type for the obstacleAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ObstacleAlertInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo from the phone's camera as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  proximityThreshold: z
    .number()
    .describe(
      'The distance threshold (in meters) at which to start alerting the user to obstacles.'
    ),
});
export type ObstacleAlertInput = z.infer<typeof ObstacleAlertInputSchema>;

const ObstacleAlertOutputSchema = z.object({
  alertLevel: z
    .enum(['NONE', 'LOW', 'MEDIUM', 'HIGH'])
    .describe(
      'The alert level based on obstacle proximity: NONE, LOW, MEDIUM, or HIGH.'
    ),
  obstacleDescription: z
    .string()
    .describe('A description of the detected obstacle.'),
});
export type ObstacleAlertOutput = z.infer<typeof ObstacleAlertOutputSchema>;

export async function obstacleAlert(input: ObstacleAlertInput): Promise<ObstacleAlertOutput> {
  return obstacleAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'obstacleAlertPrompt',
  input: {schema: ObstacleAlertInputSchema},
  output: {schema: ObstacleAlertOutputSchema},
  prompt: `You are an AI assistant designed to analyze images from a user's phone camera to detect obstacles and provide appropriate alert levels for a user with impaired vision. 

You will be provided with an image and a proximity threshold. Analyze the image for any potential obstacles in the user's path. Based on the proximity of the closest obstacle to the user (as determined by your analysis of the image), determine an appropriate alert level.

Here are the valid alert levels:
- NONE: No obstacles detected within the proximity threshold.
- LOW: An obstacle is detected within the proximity threshold, but is not immediately threatening.
- MEDIUM: An obstacle is detected and is getting closer; the user should proceed with caution.
- HIGH: An obstacle is very close; the user should stop immediately.

Proximity Threshold: {{{proximityThreshold}}} meters
Image: {{media url=photoDataUri}}

Output the alert level and a brief description of the obstacle.
`,
});

const obstacleAlertFlow = ai.defineFlow(
  {
    name: 'obstacleAlertFlow',
    inputSchema: ObstacleAlertInputSchema,
    outputSchema: ObstacleAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
