import { config } from 'dotenv';
config();

import '@/ai/flows/obstacle-alerts-from-camera.ts';
import '@/ai/flows/ground-hazard-detection-with-vibrations.ts';
import '@/ai/flows/automatic-fall-detection.ts';