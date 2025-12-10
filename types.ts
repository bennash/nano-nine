export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  timestamp: number;
}

export interface GenerationConfig {
  angle: string;
  description: string;
}

export const ANGLES: GenerationConfig[] = [
  { angle: "Isometric", description: "isometric view from top-right corner" },
  { angle: "Bird's Eye", description: "direct top-down bird's eye view" },
  { angle: "Worm's Eye", description: "low angle worm's eye view looking up" },
  { angle: "Wide Angle", description: "wide angle lens view capturing more context" },
  { angle: "Side Profile (L)", description: "profile view from the left side" },
  { angle: "Side Profile (R)", description: "profile view from the right side" },
  { angle: "Close Up", description: "detailed close-up shot of the main subject" },
  { angle: "Dutch Angle", description: "dramatic dutch angle (tilted horizon)" },
  { angle: "Cinematic", description: "cinematic establishing shot from a distance" }
];
