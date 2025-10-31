/**
 * Generate Agatha Splint Illustrations for Stories
 * 
 * Generates THREE illustrative images per story:
 * 1. Featured image (hero/header)
 * 2. First inline illustration
 * 3. Second inline illustration
 * 
 * Uses HiDream-I1 Fast model for Nordic children's book style illustrations
 * Images are saved to /tmp/ first, then need to be copied to public/ with sudo
 */

import { Runware } from '@runware/sdk-js';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { readFile } from 'fs/promises';

const RUNWARE_API_KEY = 'gE5ASqormxPzAbpLPBGOPZ6ftToGFVp3';

// Agatha Splint illustration style - authentic Nordic whimsy with essential stickman character
const BASE_STYLE = 'Hand-drawn watercolor illustration in authentic Agatha Splint style: warm autumn colors (ochre, burnt sienna, sage green, cream), soft pencil outlines, Nordic children\'s book aesthetic (Tove Jansson, Torbjørn Egner, Anne-Cath Vestly), gentle watercolor washes, whimsical characters with round faces and simple features, cozy nostalgic atmosphere, quirky absurd details';

const STICKMAN_ELEMENT = 'ESSENTIAL: Include a tiny quirky stick figure character somewhere in the scene - could be peeking from behind objects, interacting playfully with main elements, making their own little drawing, waving, running, or doing something unexpectedly funny; stick figure should be simple line-drawn with personality';

const SIGNATURE_REQUIREMENT = 'Handwritten signature "Agatha Splint" in elegant cursive script in the lower right corner, clearly visible with proper bleed margins';

const TECHNICAL_SPECS = 'No other text except signature; ensure all elements including signature are within safe margins; 1024x1024 composition';

/**
 * Generate three illustrations for a story
 */
async function generateStoryImages(storySlug, storyTitle, storyExcerpt) {
  console.log(`\n🎨 Generating Agatha Splint illustrations for: ${storyTitle}`);
  console.log(`Slug: ${storySlug}`);

  const runware = new Runware({ apiKey: RUNWARE_API_KEY });
  await runware.connect();

  const images = [];

  try {
    // 1. FEATURED IMAGE - The opening scene
    console.log('\n📸 Generating featured image (hero)...');
    const featuredPrompt = `${BASE_STYLE}. Scene: Opening moment from "${storyTitle}" - ${storyExcerpt}. Main character prominently featured with gentle expression, warm Nordic autumn light filtering through, one subtly impossible or whimsical detail (floating object, peculiar perspective, dreamlike element). ${STICKMAN_ELEMENT}. ${SIGNATURE_REQUIREMENT}. Emotion: curious wonder and gentle anticipation. ${TECHNICAL_SPECS}`;

    const featuredResult = await runware.requestImages({
      positivePrompt: featuredPrompt,
      model: 'runware:101@1', // HiDream-I1 Fast for illustrations
      numberResults: 1,
      height: 1024,
      width: 1024,
      steps: 25,
      CFGScale: 7.5,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      seedImage: undefined,
      maskImage: undefined,
      strength: undefined,
      lora: [],
      controlNet: []
    });

    if (featuredResult && featuredResult[0]?.imageURL) {
      const imageUrl = featuredResult[0].imageURL;
      console.log(`✓ Featured image generated: ${imageUrl}`);
      
      // Download and save to /tmp
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const filename = `/tmp/${storySlug}-featured.png`;
      
      // Remove existing file if it exists to avoid permission issues
      if (existsSync(filename)) {
        try {
          unlinkSync(filename);
        } catch (err) {
          console.warn(`⚠️  Could not delete existing file ${filename}, will try to overwrite`);
        }
      }
      
      writeFileSync(filename, buffer);
      console.log(`✓ Saved to: ${filename}`);
      
      images.push({
        type: 'featured',
        filename,
        url: imageUrl
      });
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. FIRST INLINE IMAGE - Mid-story moment
    console.log('\n📸 Generating first inline illustration...');
    const inline1Prompt = `${BASE_STYLE}. Scene: Mid-story moment from "${storyTitle}" - characters interacting, ${storyExcerpt}. Show playful interaction or dialogue between characters, warm cozy interior or charming outdoor setting, one absurd or delightfully odd detail prominently visible. ${STICKMAN_ELEMENT} perhaps hiding behind an object or observing the scene. ${SIGNATURE_REQUIREMENT}. Emotion: playful tension and gentle humor. ${TECHNICAL_SPECS}`;

    const inline1Result = await runware.requestImages({
      positivePrompt: inline1Prompt,
      model: 'runware:101@1',
      numberResults: 1,
      height: 1024,
      width: 1024,
      steps: 25,
      CFGScale: 7.5,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      seedImage: undefined,
      maskImage: undefined,
      strength: undefined,
      lora: [],
      controlNet: []
    });

    if (inline1Result && inline1Result[0]?.imageURL) {
      const imageUrl = inline1Result[0].imageURL;
      console.log(`✓ First inline image generated: ${imageUrl}`);
      
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const filename = `/tmp/${storySlug}-inline1.png`;
      
      // Remove existing file if it exists to avoid permission issues
      if (existsSync(filename)) {
        try {
          unlinkSync(filename);
        } catch (err) {
          console.warn(`⚠️  Could not delete existing file ${filename}, will try to overwrite`);
        }
      }
      
      writeFileSync(filename, buffer);
      console.log(`✓ Saved to: ${filename}`);
      
      images.push({
        type: 'inline1',
        filename,
        url: imageUrl
      });
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. SECOND INLINE IMAGE - Closing/resolution scene
    console.log('\n📸 Generating second inline illustration...');
    const inline2Prompt = `${BASE_STYLE}. Scene: Closing moment from "${storyTitle}" - resolution or lingering mystery, ${storyExcerpt}. Character in quiet reflection or gentle triumph, soft evening/twilight atmosphere, emotional warmth with hint of melancholy or wonder. ${STICKMAN_ELEMENT} sitting contentedly or waving goodbye. ${SIGNATURE_REQUIREMENT}. Emotion: gentle melancholic wonder and cozy satisfaction. ${TECHNICAL_SPECS}`;

    const inline2Result = await runware.requestImages({
      positivePrompt: inline2Prompt,
      model: 'runware:101@1',
      numberResults: 1,
      height: 1024,
      width: 1024,
      steps: 25,
      CFGScale: 7.5,
      scheduler: 'FlowMatchEulerDiscreteScheduler',
      seedImage: undefined,
      maskImage: undefined,
      strength: undefined,
      lora: [],
      controlNet: []
    });

    if (inline2Result && inline2Result[0]?.imageURL) {
      const imageUrl = inline2Result[0].imageURL;
      console.log(`✓ Second inline image generated: ${imageUrl}`);
      
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      const filename = `/tmp/${storySlug}-inline2.png`;
      
      // Remove existing file if it exists to avoid permission issues
      if (existsSync(filename)) {
        try {
          unlinkSync(filename);
        } catch (err) {
          console.warn(`⚠️  Could not delete existing file ${filename}, will try to overwrite`);
        }
      }
      
      writeFileSync(filename, buffer);
      console.log(`✓ Saved to: ${filename}`);
      
      images.push({
        type: 'inline2',
        filename,
        url: imageUrl
      });
    }

    console.log('\n✅ All illustrations generated successfully!');
    console.log('\n📦 Generated files:');
    images.forEach(img => {
      console.log(`  ${img.type}: ${img.filename}`);
    });

    console.log('\n⚠️  Next steps (requires sudo):');
    console.log(`  sudo cp ${images[0]?.filename} /var/www/vhosts/pjuskeby.org/public/assets/agatha/story/`);
    console.log(`  sudo cp ${images[1]?.filename} /var/www/vhosts/pjuskeby.org/public/assets/agatha/story/`);
    console.log(`  sudo cp ${images[2]?.filename} /var/www/vhosts/pjuskeby.org/public/assets/agatha/story/`);
    console.log(`  sudo chown pjuskebysverden:psacln /var/www/vhosts/pjuskeby.org/public/assets/agatha/story/${storySlug}-*.png`);
    console.log(`  sudo chmod 644 /var/www/vhosts/pjuskeby.org/public/assets/agatha/story/${storySlug}-*.png`);

    return images;

  } catch (error) {
    console.error('❌ Error generating images:', error);
    throw error;
  } finally {
    await runware.disconnect();
  }
}

// CLI usage
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node scripts/generate-story-images.mjs <slug> <title> <excerpt>');
  console.log('Example: node scripts/generate-story-images.mjs 2025-10-17-event-abc123 "The Dancing Teacup" "A story about a teacup that learned to waltz..."');
  process.exit(1);
}

const [slug, title, ...excerptParts] = args;
const excerpt = excerptParts.join(' ');

generateStoryImages(slug, title, excerpt).catch(error => {
  console.error('Failed:', error);
  process.exit(1);
});
