# 🎨 Agatha Splint Image Generation System

**A whimsical, warm, and witty image generation system for Pjuskeby**

## Overview

The Agatha Splint system integrates with Runware.ai API to generate images that embody the "Agatha Splint spirit":

- **Warm, witty, human tone** - never sterile
- **Soft Nordic daylight** - muted contrast, subtle bloom
- **Vintage watercolor / hand-tinted look**
- **Emotion:** curiosity, tenderness, a hint of mischief
- **Composition:** small asymmetries, visible brush strokes
- **Always includes a Stickman character** doing something funny or self-aware
- **Handwritten "Agatha Splint" signature** in bottom-right corner

## Models

### 📸 Photorealistic (SDXL Base)
Used for: Places, People, Businesses, Streets
- Resolution: 1024×1024 px
- Steps: 24
- CFG Scale: 8
- 90% photorealism + 10% illustrative overlay

### 🎨 Illustrative (HiDream-I1 Fast)
Used for: Stories (2 images per story)
- Resolution: 1024×1024 px
- Steps: 22
- CFG Scale: 8
- Nordic children's book style (Jansson/Egner/Vestly)

## API Reference

### Generate Person Image
```typescript
import { generatePersonImage } from './src/lib/agatha-splint';

const metadata = await generatePersonImage({
  name: 'Lars Hansen',
  slug: 'lars-hansen',
  description: 'A cheerful jogger',
  hobbies: ['running', 'photography']
});
```

### Generate Place Image
```typescript
import { generatePlaceImage } from './src/lib/agatha-splint';

const metadata = await generatePlaceImage({
  name: 'Makeout Mountain',
  slug: 'makeout-mountain',
  description: 'A romantic cliff face'
});
```

### Generate Business Image
```typescript
import { generateBusinessImage } from './src/lib/agatha-splint';

const metadata = await generateBusinessImage({
  name: 'Flying Croissant Bakery',
  slug: 'flying-croissant-bakery',
  business_type: 'bakery',
  description: 'Pastries that float'
});
```

### Generate Street Image
```typescript
import { generateStreetImage } from './src/lib/agatha-splint';

const metadata = await generateStreetImage({
  name: 'Whistle Lane',
  slug: 'whistle-lane',
  description: 'Where melodies drift'
});
```

### Generate Story Images (2 per story)
```typescript
import { generateStoryImages } from './src/lib/agatha-splint';

const [opening, keyMoment] = await generateStoryImages({
  title: 'The Baker Who Forgot',
  slug: 'baker-who-forgot',
  description: 'A tale of missing memories',
  content: 'Long story text...'
});
```

### Batch Generation
```typescript
import { batchGenerateImages } from './src/lib/agatha-splint';

const results = await batchGenerateImages([
  { type: 'person', data: personData },
  { type: 'place', data: placeData },
  { type: 'business', data: businessData }
]);
```

## Metadata Output

Each generation returns:

```typescript
interface AgathaImageMetadata {
  category: 'person' | 'place' | 'business' | 'story' | 'street';
  name: string;
  description: string;
  emotions: string[];
  odd_detail: string;          // The playful surreal element
  stickman_action: string;     // What the Stickman is doing
  signature: string;           // Always "Agatha Splint"
  model: string;               // SDXL or HiDream-I1
  output_path: string;         // Where to save the image
  taskUUID: string;            // Runware task identifier
}
```

## Environment Setup

Add to `.env`:

```bash
# Runware.ai API for Agatha Splint image generation
RUNWARE_API_KEY=your_api_key_here
```

## Prompt Structure

### Photorealistic Scenes
- Real materials, weather, local atmosphere
- One playful surreal detail (e.g., "a lamppost reading a newspaper")
- Hand-drawn Stickman performing humorous act
- "Agatha Splint" signature bottom-right

### Illustrative Scenes (Stories)
- Nordic children's book aesthetic
- Hand-drawn watercolor textures
- Main character + emotion
- One strange/impossible detail
- Mischievous Stickman with meta gag
- No text except signature

## Stylistic Rules

### Universal Directives
- **Lighting:** Soft Nordic daylight, muted contrast, subtle bloom
- **Color palette:** Vintage watercolor, hand-tinted, pastel undertones
- **Emotion:** Curiosity, tenderness, mischief
- **Composition:** Small asymmetries, visible brush strokes
- **Stickman:** ALWAYS present, canonical character
- **Signature:** ALWAYS visible bottom-right, fully clear

### Prohibitions
- ❌ No text other than signature
- ❌ No cold HDR looks
- ❌ No sterile clinical vibes
- ❌ No harsh lighting
- ❌ No plastic/oversharpened skin
- ❌ No extra fingers/deformed hands

## Runware API Details

### HTTP REST
- Endpoint: `https://api.runware.ai/v1`
- Method: `POST`
- Header: `Authorization: Bearer <API_KEY>`
- Payload: Array of task objects

### Task Structure
```json
[
  {
    "taskType": "imageInference",
    "taskUUID": "uuid-v4-here",
    "deliveryMethod": "sync",
    "outputType": "URL",
    "outputFormat": "PNG",
    "width": 1024,
    "height": 1024,
    "steps": 24,
    "CFGScale": 8,
    "numberResults": 1,
    "model": "runware:101@1",
    "positivePrompt": "...",
    "negativePrompt": "..."
  }
]
```

### Response Structure
```json
{
  "data": [
    {
      "taskUUID": "...",
      "imageURL": "https://...",
      "imageBase64Data": "..."
    }
  ],
  "errors": []
}
```

## Error Handling

- Always check `errors[]` array in response
- Validate `data[]` exists before accessing
- Log `taskUUID` for debugging
- Implement retry logic with exponential backoff for async jobs

## File Organization

```
/assets/agatha/
├── person/
│   ├── lars-hansen.png
│   └── lars-hansen.json
├── place/
│   ├── makeout-mountain.png
│   └── makeout-mountain.json
├── business/
│   ├── flying-croissant-bakery.png
│   └── flying-croissant-bakery.json
├── street/
│   ├── whistle-lane.png
│   └── whistle-lane.json
└── story/
    ├── baker-who-forgot-opening.png
    ├── baker-who-forgot-key.png
    └── baker-who-forgot.json
```

## Common Pitfalls

1. **Forgetting the Stickman** - He's canonical, never omit
2. **Extra text** - Only signature allowed
3. **Cold HDR looks** - Even photorealism must feel humane
4. **Hidden signature** - Must be fully visible bottom-right
5. **Single object payload** - Runware requires array of tasks
6. **Missing taskUUID** - Every task needs unique UUID v4
7. **Not checking errors** - Always validate `errors[]` array

## Testing

Run the test script:

```bash
node scripts/test-agatha-splint.js
```

## Credits

**Agatha Splint System** - Whimsical image generation for Pjuskeby  
**Powered by:** Runware.ai API  
**Models:** SDXL Base, HiDream-I1 Fast  
**Created:** October 17, 2025

---

*"Every image tells a story, and every story has a stickman causing mild chaos."* – Agatha Splint
