/**
 * Generate Agatha Splint image for Dotty McFlap
 */

import { randomUUID } from 'crypto';
import 'dotenv/config';

const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;
const RUNWARE_API_URL = 'https://api.runware.ai/v1';

// Dotty McFlap data
const dottyData = {
  name: 'Dotty McFlap',
  slug: 'dotty-mcflap',
  age: 69,
  role: 'The Very Curious Café',
  description: 'Replaced all her light bulbs with glitter',
  hobbies: ['synchronised yawning', 'training carrots']
};

// Agatha Splint style constants
const AGATHA_STYLE_BASE = `warm and witty human tone, soft Nordic daylight with muted contrast and subtle bloom, vintage watercolor hand-tinted look, curiosity tenderness and hint of mischief, small asymmetries and visible brush strokes`;

const AGATHA_NEGATIVE = `low quality, extra fingers, deformed hands, extra limbs, text other than signature, watermark, harsh HDR, oversharpened, plastic skin, sterile clinical look, cold lighting`;

// Build photorealistic prompt for Dotty
function buildDottyPrompt() {
  const hobbiesText = dottyData.hobbies.join(' and ');
  const oddDetail = 'a lamppost reading a tiny newspaper in the background';
  const stickmanAction = 'peeking from her jacket pocket holding a tiny glittery light bulb';
  
  return `hyper-realistic portrait of ${dottyData.name}, ${dottyData.age} years old, cheerful woman at ${dottyData.role}, engaged in ${hobbiesText}, lively kind and emotionally authentic, ${dottyData.description}, surrounded by subtle glittery glow from replaced light bulbs; ${AGATHA_STYLE_BASE}; playful surreal detail: ${oddDetail}; include small hand-drawn stickman character ${stickmanAction}; ensure handwritten signature "Agatha Splint" bottom-right fully visible and clear`;
}

// Create Runware task
function createRunwareTask() {
  return {
    taskType: 'imageInference',
    taskUUID: randomUUID(),
    deliveryMethod: 'sync',
    outputType: 'URL',
    outputFormat: 'PNG',
    width: 1024,
    height: 1024,
    steps: 24,
    CFGScale: 8,
    numberResults: 1,
    model: 'runware:101@1', // SDXL Base
    positivePrompt: buildDottyPrompt(),
    negativePrompt: AGATHA_NEGATIVE
  };
}

// Call Runware API
async function generateDottyImage() {
  console.log('🎨 Generating Agatha Splint image for Dotty McFlap...\n');
  
  if (!RUNWARE_API_KEY) {
    throw new Error('❌ RUNWARE_API_KEY not found in .env file');
  }
  
  const task = createRunwareTask();
  
  console.log('📝 Prompt:', task.positivePrompt.substring(0, 150) + '...\n');
  console.log('🔄 Calling Runware API...\n');
  
  try {
    const response = await fetch(RUNWARE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWARE_API_KEY}`
      },
      body: JSON.stringify([task]) // Always array!
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Check for errors
    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      console.error('❌ API returned errors:', JSON.stringify(result.errors, null, 2));
      throw new Error(`Runware API error: ${JSON.stringify(result.errors)}`);
    }
    
    // Extract image URL
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      const imageData = result.data[0];
      
      console.log('✅ Image generated successfully!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('🖼️  DOTTY MCFLAP - AGATHA SPLINT IMAGE\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('👤 Person:', dottyData.name);
      console.log('🎭 Role:', dottyData.role);
      console.log('📝 Description:', dottyData.description);
      console.log('🎨 Hobbies:', dottyData.hobbies.join(', '));
      console.log('\n🔗 Image URL:');
      console.log(imageData.imageURL || imageData.imageUrl);
      console.log('\n🌐 Profile URL:');
      console.log('https://pjuskeby.org/personer/dotty-mcflap');
      console.log('\n📊 Metadata:');
      console.log('  • Task UUID:', task.taskUUID);
      console.log('  • Model: SDXL Base (photorealistic)');
      console.log('  • Resolution: 1024×1024 px');
      console.log('  • Steps: 24');
      console.log('  • CFG Scale: 8');
      console.log('\n🎭 Agatha Splint Elements:');
      console.log('  • Stickman: Peeking from pocket with glittery bulb');
      console.log('  • Odd detail: Lamppost reading newspaper');
      console.log('  • Signature: "Agatha Splint" bottom-right');
      console.log('  • Style: Warm Nordic daylight, vintage watercolor');
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Save metadata
      const metadata = {
        category: 'person',
        name: dottyData.name,
        slug: dottyData.slug,
        description: dottyData.description,
        age: dottyData.age,
        role: dottyData.role,
        hobbies: dottyData.hobbies,
        emotions: ['joy', 'curiosity', 'mischief'],
        odd_detail: 'lamppost reading newspaper',
        stickman_action: 'peeking from pocket with glittery light bulb',
        signature: 'Agatha Splint',
        model: 'SDXL Base',
        taskUUID: task.taskUUID,
        imageURL: imageData.imageURL || imageData.imageUrl,
        generated_at: new Date().toISOString(),
        profile_url: 'https://pjuskeby.org/personer/dotty-mcflap'
      };
      
      return metadata;
      
    } else {
      console.error('❌ No image data in response:', result);
      throw new Error('No image data returned from API');
    }
    
  } catch (error) {
    console.error('❌ Error generating image:', error.message);
    throw error;
  }
}

// Run generation
generateDottyImage()
  .then(() => {
    console.log('🎉 Generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Generation failed:', error);
    process.exit(1);
  });
