/**
 * Agatha Splint Image Generation System
 * 
 * Integrates with Runware.ai API to generate images for:
 * - Places (photorealistic SDXL)
 * - People (photorealistic SDXL)
 * - Businesses (photorealistic SDXL)
 * - Streets (photorealistic SDXL)
 * - Stories (illustrative HiDream-I1 Fast, 2 images per story)
 * 
 * All images follow the "Agatha Splint spirit":
 * - Warm, witty, human tone
 * - Soft Nordic daylight
 * - Vintage watercolor / hand-tinted look
 * - Curiosity, tenderness, mischief
 * - Always includes a Stickman character
 * - Handwritten "Agatha Splint" signature bottom-right
 */

import { randomUUID } from 'crypto';

// Model IDs (replace with actual Runware AIR IDs)
const MODELS = {
  SDXL_BASE: 'runware:101@1', // Photorealistic
  HIDREAM_I1_FAST: 'civitai:133005@144690' // Illustrative
};

// Runware API configuration
const RUNWARE_API_URL = 'https://api.runware.ai/v1';

export type ImageCategory = 'person' | 'place' | 'business' | 'story' | 'street';

export interface AgathaImageMetadata {
  category: ImageCategory;
  name: string;
  description: string;
  emotions: string[];
  odd_detail: string;
  stickman_action: string;
  signature: string;
  model: string;
  output_path: string;
  taskUUID?: string;
}

export interface RunwareTask {
  taskType: string;
  taskUUID: string;
  deliveryMethod: 'sync' | 'async';
  outputType: 'URL' | 'base64Data';
  outputFormat: 'PNG' | 'JPEG' | 'WEBP';
  width: number;
  height: number;
  steps: number;
  CFGScale: number;
  numberResults: number;
  model: string;
  positivePrompt: string;
  negativePrompt: string;
}

/**
 * Base stylistic directives for all Agatha Splint images
 */
const AGATHA_STYLE_BASE = `warm and witty human tone, soft Nordic daylight with muted contrast and subtle bloom, vintage watercolor hand-tinted look, curiosity tenderness and hint of mischief, small asymmetries and visible brush strokes`;

const AGATHA_NEGATIVE = `low quality, extra fingers, deformed hands, extra limbs, text other than signature, watermark, harsh HDR, oversharpened, plastic skin, sterile clinical look, cold lighting`;

/**
 * Build prompt for photorealistic scenes (SDXL)
 */
function buildPhotoPrompt(
  category: ImageCategory,
  data: any,
  oddDetail: string,
  stickmanAction: string
): string {
  const baseStyle = AGATHA_STYLE_BASE;
  
  let sceneDescription = '';
  
  switch (category) {
    case 'place':
      sceneDescription = `photorealistic depiction of ${data.name}, ${data.description}, showing real materials weather and local atmosphere`;
      break;
      
    case 'person':
      const hobbies = data.hobbies?.join(', ') || 'relaxing';
      sceneDescription = `hyper-realistic portrait of ${data.name} engaging in ${hobbies}, lively kind and emotionally authentic, ${data.description}`;
      break;
      
    case 'business':
      sceneDescription = `realistic depiction of ${data.name}, ${data.business_type} workplace or storefront, inviting and humorous professionalism, ${data.description}`;
      break;
      
    case 'street':
      sceneDescription = `cheerful photorealistic depiction of ${data.name} in Nordic town style, showing its unique charm with children playing cozy houses friendly people pastel colors`;
      break;
  }
  
  return `${sceneDescription}; ${baseStyle}; playful surreal detail: ${oddDetail}; include small hand-drawn stickman character ${stickmanAction}; ensure handwritten signature "Agatha Splint" bottom-right fully visible and clear`;
}

/**
 * Build prompt for illustrative scenes (HiDream-I1 Fast)
 */
function buildIllustrativePrompt(
  storyExcerpt: string,
  emotion: string,
  oddDetail: string,
  stickmanAction: string,
  isOpeningScene: boolean
): string {
  const sceneType = isOpeningScene ? 'opening scene introducing emotion and main character' : 'key moment capturing tension or resolution';
  
  return `hand-drawn watercolor illustration in Nordic children's book style (Jansson Egner Vestly Andersen Lindgren), ${sceneType}; ${storyExcerpt}; emotion: ${emotion}; one strange impossible detail: ${oddDetail}; ${AGATHA_STYLE_BASE}; playful layout warm hues; include tiny stickman ${stickmanAction}; add handwritten signature "Agatha Splint" bottom-right; no other text`;
}

/**
 * Create Runware task object
 */
function createRunwareTask(
  positivePrompt: string,
  model: string,
  deliveryMethod: 'sync' | 'async' = 'sync'
): RunwareTask {
  return {
    taskType: 'imageInference',
    taskUUID: randomUUID(),
    deliveryMethod,
    outputType: 'URL',
    outputFormat: 'PNG',
    width: 1024,
    height: 1024,
    steps: model === MODELS.SDXL_BASE ? 24 : 22,
    CFGScale: 8,
    numberResults: 1,
    model,
    positivePrompt,
    negativePrompt: AGATHA_NEGATIVE
  };
}

/**
 * Call Runware API (HTTP REST)
 */
async function callRunwareAPI(tasks: RunwareTask[]): Promise<any> {
  const apiKey = process.env.RUNWARE_API_KEY;
  
  if (!apiKey) {
    throw new Error('RUNWARE_API_KEY not found in environment');
  }
  
  const response = await fetch(RUNWARE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(tasks)
  });
  
  if (!response.ok) {
    throw new Error(`Runware API error: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json() as any;
  
  // Check for errors
  if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
    throw new Error(`Runware API error: ${JSON.stringify(result.errors)}`);
  }
  
  return result;
}

/**
 * Generate image for a person
 */
export async function generatePersonImage(personData: any): Promise<AgathaImageMetadata> {
  const oddDetail = 'a lamppost reading a tiny newspaper';
  const stickmanAction = 'peeking from the jacket pocket holding a tiny brush';
  
  const prompt = buildPhotoPrompt('person', personData, oddDetail, stickmanAction);
  const task = createRunwareTask(prompt, MODELS.SDXL_BASE);
  
  await callRunwareAPI([task]);
  
  const metadata: AgathaImageMetadata = {
    category: 'person',
    name: personData.name,
    description: personData.description,
    emotions: ['joy', 'curiosity'],
    odd_detail: oddDetail,
    stickman_action: stickmanAction,
    signature: 'Agatha Splint',
    model: MODELS.SDXL_BASE,
    output_path: `/assets/agatha/person/${personData.slug}.png`,
    taskUUID: task.taskUUID
  };
  
  return metadata;
}

/**
 * Generate image for a place
 */
export async function generatePlaceImage(placeData: any): Promise<AgathaImageMetadata> {
  const oddDetails = [
    'a bench reading a book',
    'clouds shaped like teacups',
    'a lamppost wearing a tiny scarf',
    'flowers whispering to each other',
    'a mailbox winking'
  ];
  const oddDetail = oddDetails[Math.floor(Math.random() * oddDetails.length)];
  
  const stickmanActions = [
    'riding a paper airplane across the scene',
    'painting the sky with a tiny brush',
    'building a miniature sandcastle',
    'conducting invisible orchestra',
    'reading a map upside down'
  ];
  const stickmanAction = stickmanActions[Math.floor(Math.random() * stickmanActions.length)];
  
  const prompt = buildPhotoPrompt('place', placeData, oddDetail, stickmanAction);
  const task = createRunwareTask(prompt, MODELS.SDXL_BASE);
  
  await callRunwareAPI([task]);
  
  const metadata: AgathaImageMetadata = {
    category: 'place',
    name: placeData.name,
    description: placeData.description,
    emotions: ['nostalgia', 'wonder'],
    odd_detail: oddDetail,
    stickman_action: stickmanAction,
    signature: 'Agatha Splint',
    model: MODELS.SDXL_BASE,
    output_path: `/assets/agatha/place/${placeData.slug}.png`,
    taskUUID: task.taskUUID
  };
  
  return metadata;
}

/**
 * Generate image for a business
 */
export async function generateBusinessImage(businessData: any): Promise<AgathaImageMetadata> {
  const oddDetails = [
    'flying croissants in formation',
    'folders having a quiet conversation',
    'coffee cups doing synchronized swimming',
    'staplers playing cards',
    'pens writing poetry to each other'
  ];
  const oddDetail = oddDetails[Math.floor(Math.random() * oddDetails.length)];
  
  const stickmanAction = 'accidentally photobombing from behind a plant';
  
  const prompt = buildPhotoPrompt('business', businessData, oddDetail, stickmanAction);
  const task = createRunwareTask(prompt, MODELS.SDXL_BASE);
  
  await callRunwareAPI([task]);
  
  const metadata: AgathaImageMetadata = {
    category: 'business',
    name: businessData.name,
    description: businessData.description,
    emotions: ['professionalism', 'humor'],
    odd_detail: oddDetail,
    stickman_action: stickmanAction,
    signature: 'Agatha Splint',
    model: MODELS.HIDREAM_I1_FAST,
    output_path: `/assets/agatha/business/${businessData.slug}.png`,
    taskUUID: task.taskUUID
  };
  
  return metadata;
}

/**
 * Generate image for a street
 */
export async function generateStreetImage(streetData: any): Promise<AgathaImageMetadata> {
  const oddDetail = 'one house slightly floating above ground';
  const stickmanAction = 'causing mild chaos by juggling invisible balls';
  
  const prompt = buildPhotoPrompt('street', streetData, oddDetail, stickmanAction);
  const task = createRunwareTask(prompt, MODELS.SDXL_BASE);
  
  await callRunwareAPI([task]);
  
  const metadata: AgathaImageMetadata = {
    category: 'street',
    name: streetData.name,
    description: streetData.description,
    emotions: ['joy', 'nostalgia'],
    odd_detail: oddDetail,
    stickman_action: stickmanAction,
    signature: 'Agatha Splint',
    model: MODELS.SDXL_BASE,
    output_path: `/assets/agatha/street/${streetData.slug}.png`,
    taskUUID: task.taskUUID
  };
  
  return metadata;
}

/**
 * Generate two images for a story (opening + key moment)
 */
export async function generateStoryImages(storyData: any): Promise<AgathaImageMetadata[]> {
  const excerpt = storyData.content?.substring(0, 200) || storyData.description;
  
  // Opening scene
  const openingOddDetail = 'a goose knitting fog';
  const openingStickman = 'stirring a teacup like a rowing boat';
  const openingPrompt = buildIllustrativePrompt(
    excerpt,
    'hopeful curiosity',
    openingOddDetail,
    openingStickman,
    true
  );
  
  // Key moment scene
  const keyOddDetail = 'stairs made of melting chocolate';
  const keyStickman = 'painting the frame from inside the picture';
  const keyPrompt = buildIllustrativePrompt(
    excerpt,
    'tension and wonder',
    keyOddDetail,
    keyStickman,
    false
  );
  
  const openingTask = createRunwareTask(openingPrompt, MODELS.HIDREAM_I1_FAST);
  const keyTask = createRunwareTask(keyPrompt, MODELS.HIDREAM_I1_FAST);
  
  await callRunwareAPI([openingTask, keyTask]);
  
  return [
    {
      category: 'story',
      name: `${storyData.title} - Opening`,
      description: storyData.description,
      emotions: ['curiosity', 'hope'],
      odd_detail: openingOddDetail,
      stickman_action: openingStickman,
      signature: 'Agatha Splint',
      model: MODELS.HIDREAM_I1_FAST,
      output_path: `/assets/agatha/story/${storyData.slug}-opening.png`,
      taskUUID: openingTask.taskUUID
    },
    {
      category: 'story',
      name: `${storyData.title} - Key Moment`,
      description: storyData.description,
      emotions: ['tension', 'wonder'],
      odd_detail: keyOddDetail,
      stickman_action: keyStickman,
      signature: 'Agatha Splint',
      model: MODELS.HIDREAM_I1_FAST,
      output_path: `/assets/agatha/story/${storyData.slug}-key.png`,
      taskUUID: keyTask.taskUUID
    }
  ];
}

/**
 * Batch generate images (with proper array payload)
 */
export async function batchGenerateImages(requests: Array<{
  type: ImageCategory;
  data: any;
}>): Promise<AgathaImageMetadata[]> {
  const tasks: RunwareTask[] = [];
  const metadata: AgathaImageMetadata[] = [];
  
  for (const req of requests) {
    let prompt = '';
    let model = MODELS.SDXL_BASE;
    let oddDetail = '';
    let stickmanAction = '';
    
    switch (req.type) {
      case 'person':
        oddDetail = 'a lamppost reading a newspaper';
        stickmanAction = 'peeking from pocket';
        prompt = buildPhotoPrompt(req.type, req.data, oddDetail, stickmanAction);
        break;
        
      case 'place':
        oddDetail = 'clouds shaped like teacups';
        stickmanAction = 'painting the sky';
        prompt = buildPhotoPrompt(req.type, req.data, oddDetail, stickmanAction);
        break;
        
      case 'business':
        oddDetail = 'folders chatting quietly';
        stickmanAction = 'photobombing from behind plant';
        prompt = buildPhotoPrompt(req.type, req.data, oddDetail, stickmanAction);
        break;
        
      case 'street':
        oddDetail = 'one house slightly floating';
        stickmanAction = 'causing mild chaos';
        prompt = buildPhotoPrompt(req.type, req.data, oddDetail, stickmanAction);
        break;
    }
    
    const task = createRunwareTask(prompt, model, 'async');
    tasks.push(task);
    
    metadata.push({
      category: req.type,
      name: req.data.name,
      description: req.data.description,
      emotions: ['joy'],
      odd_detail: oddDetail,
      stickman_action: stickmanAction,
      signature: 'Agatha Splint',
      model,
      output_path: `/assets/agatha/${req.type}/${req.data.slug}.png`,
      taskUUID: task.taskUUID
    });
  }
  
  // Submit batch
  await callRunwareAPI(tasks);
  
  return metadata;
}
