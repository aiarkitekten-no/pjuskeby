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

// Agatha Splint illustration style base
const ILLUSTRATION_STYLE = 'hand-drawn watercolor illustration in Nordic children\'s book style (Tove Jansson, Torbjørn Egner, Anne-Cath Vestly, H.C. Andersen, Astrid Lindgren), warm hues, playful layout, emotional cues, whimsical details, gentle absurdity';

const AGATHA_SIGNATURE = 'handwritten signature "Agatha Splint" in elegant script bottom-right corner';

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
    const featuredPrompt = `${ILLUSTRATION_STYLE}; opening scene from "${storyTitle}"; ${storyExcerpt}; main character in focus; warm Nordic light; one strange impossible detail; tiny stickman character peeking from corner holding teacup; emotion: curious wonder; ${AGATHA_SIGNATURE}; no other text`;

    const featuredResult = await runware.requestImages({
      positivePrompt: featuredPrompt,
      model: 'runware:101@1', // HiDream-I1 Fast for illustrations
      numberResults: 1,
      height: 1024,
      width: 1024,
      steps: 20,
      CFGScale: 7,
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
    const inline1Prompt = `${ILLUSTRATION_STYLE}; scene from middle of story "${storyTitle}"; characters interacting; ${storyExcerpt}; one absurd detail prominent; tiny stickman character hiding behind object; emotion: playful tension; ${AGATHA_SIGNATURE}; no other text`;

    const inline1Result = await runware.requestImages({
      positivePrompt: inline1Prompt,
      model: 'runware:101@1',
      numberResults: 1,
      height: 1024,
      width: 1024,
      steps: 20,
      CFGScale: 7,
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
    const inline2Prompt = `${ILLUSTRATION_STYLE}; closing scene from "${storyTitle}"; resolution or lingering mystery; ${storyExcerpt}; emotional reflection; tiny stickman character sitting contentedly with teacup; emotion: gentle melancholy wonder; ${AGATHA_SIGNATURE}; no other text`;

    const inline2Result = await runware.requestImages({
      positivePrompt: inline2Prompt,
      model: 'runware:101@1',
      numberResults: 1,
      height: 1024,
      width: 1024,
      steps: 20,
      CFGScale: 7,
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
