#!/usr/bin/env node

import { randomUUID } from 'crypto';

const RUNWARE_API_KEY = 'gE5ASqormxPzAbpLPBGOPZ6ftToGFVp3';

// Milly Wiggleflap character data
const character = {
  name: 'Milly Wiggleflap',
  age: 78,
  role: 'The Pudding Forecast Centre',
  description: 'Believes clouds are just lazy sheep',
  hobbies: ['collecting left socks', 'tickling dandelions', 'cloud psychology', 'pudding prophecy'],
  personality: 'Gently eccentric, scientifically unorthodox, deeply observant, tenderly absurd'
};

// Build photorealistic prompt for 78-year-old woman
const prompt = `hyper-realistic portrait of ${character.name}, ${character.age} years old, gentle elderly woman with kind wise eyes and soft smile, at ${character.role}, engaged in ${character.hobbies[0]} and ${character.hobbies[1]}, ${character.personality}, surrounded by subtle wisps of cloud-like shapes and dandelion seeds floating in warm light, lively kind and emotionally authentic, weathered hands holding a wooden spoon and a left sock, naturalistic lighting, warm Nordic daylight, vintage hand-tinted photograph aesthetic, visible paint strokes and textural imperfections, small hand-drawn Stickman character peeking from her cardigan pocket holding a tiny pudding cup, one odd whimsical detail: a miniature sheep-shaped cloud resting on her shoulder, signature "Agatha Splint" in elegant handwriting bottom-right corner, 8k highly detailed, authentic and human`;

const negativePrompt = 'cartoon, anime, illustration, 3d render, plastic skin, artificial, deformed hands, extra fingers, missing fingers, blurry face, symmetrical, perfect, flawless, HDR tone mapping, cold lighting, oversaturated, no extra text, no watermarks, no logos, sterile, corporate';

const taskPayload = {
  taskType: 'imageInference',
  taskUUID: randomUUID(),
  model: 'runware:100@1', // SDXL Base - photorealistic
  positivePrompt: prompt,
  negativePrompt: negativePrompt,
  width: 1024,
  height: 1024,
  numberResults: 1,
  outputFormat: 'PNG',
  uploadEndpoint: 'URL',
  includeCost: true,
  steps: 24,
  CFGScale: 8,
  scheduler: 'FlowMatchEulerDiscreteScheduler',
  seed: Math.floor(Math.random() * 1000000),
  checkNSFW: false,
  seedImage: null,
  maskImage: null,
  strength: 1.0
};

console.log('🎨 Generating Agatha Splint portrait for', character.name);
console.log('📝 Prompt:', prompt.substring(0, 100) + '...');
console.log('🔑 Using SDXL Base (photorealistic)');
console.log('');

try {
  const response = await fetch('https://api.runware.ai/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RUNWARE_API_KEY}`
    },
    body: JSON.stringify([taskPayload])
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('❌ API Error:', result);
    process.exit(1);
  }

  if (result.errors && result.errors.length > 0) {
    console.error('❌ Errors:', result.errors);
    process.exit(1);
  }

  if (result.data && result.data.length > 0) {
    const imageData = result.data[0];
    
    console.log('✅ Image generated successfully!');
    console.log('');
    console.log('👤 Person:', character.name);
    console.log('🎭 Role:', character.role);
    console.log('📝 Description:', character.description);
    console.log('🎨 Hobbies:', character.hobbies.join(', '));
    console.log('');
    console.log('🔗 Image URL:');
    console.log(imageData.imageURL);
    console.log('');
    console.log('🌐 Profile URL:');
    console.log(`https://pjuskeby.org/personer/${character.name.toLowerCase().replace(/ /g, '-')}`);
    console.log('');
    console.log('📊 Metadata:');
    console.log('  • Task UUID:', taskPayload.taskUUID);
    console.log('  • Model: SDXL Base (photorealistic)');
    console.log('  • Resolution:', `${taskPayload.width}×${taskPayload.height} px`);
    console.log('  • Steps:', taskPayload.steps);
    console.log('  • CFG Scale:', taskPayload.CFGScale);
    console.log('');
    console.log('🎭 Agatha Splint Elements:');
    console.log('  • Stickman: Peeking from cardigan pocket with pudding cup');
    console.log('  • Odd detail: Miniature sheep-shaped cloud on shoulder');
    console.log('  • Signature: "Agatha Splint" bottom-right');
    console.log('  • Style: Warm Nordic daylight, vintage hand-tinted');
    console.log('');
    console.log('💾 Next steps:');
    console.log('  1. Download image:');
    console.log(`     curl -o /tmp/milly-wiggleflap.png "${imageData.imageURL}"`);
    console.log('  2. Copy to public (needs sudo):');
    console.log('     sudo cp /tmp/milly-wiggleflap.png /var/www/vhosts/pjuskeby.org/public/assets/agatha/person/');
    console.log('  3. Fix permissions (needs sudo):');
    console.log('     sudo chown pjuskebysverden:psacln /var/www/vhosts/pjuskeby.org/public/assets/agatha/person/milly-wiggleflap.png');
    console.log('     sudo chmod 644 /var/www/vhosts/pjuskeby.org/public/assets/agatha/person/milly-wiggleflap.png');
    console.log('  4. Build and deploy:');
    console.log('     cd /var/www/vhosts/pjuskeby.org && npm run build && cp -r dist/* httpdocs/ && pm2 restart pjuskeby-web');
  } else {
    console.error('❌ No image data in response');
    console.error(result);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
}
