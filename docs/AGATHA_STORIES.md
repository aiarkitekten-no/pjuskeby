# 📖 Agatha Splint Story System

Complete system for generating AI-written stories with Nordic children's book style illustrations.

## ✨ Overview

Stories are written by **Agatha Splint**, a slightly haunted teacup of a storyteller who writes in a unique voice blending:
- **Astrid Lindgren** – Wild-hearted rebellion & poetic mischief
- **Anne-Cath. Vestly** – Coffee-wisdom & everyday epic
- **Torbjørn Egner** – Rhyme, rhythm & town logic
- **H.C. Andersen** – Symbolic emotion & outsider grace
- **Tove Jansson** – Existential whimsy & pine-scented longing

Each story includes:
- ✍️ 800+ word narrative in Agatha's voice
- 🫖 Tea/biscuit break interruptions
- 🎨 3 hand-drawn watercolor illustrations (Nordic children's book style)
- 📝 Agatha's post-script about why stories are free

## 🚀 Quick Start (One Command)

Generate a complete story with illustrations:

```bash
sh scripts/generate-complete-story.sh [story-type]
```

Story types: `agatha-diary`, `rumor`, `event` (random if not specified)

This will:
1. Generate story text with AI (GPT-4o or Claude)
2. Generate 3 illustrations with Runware.ai
3. Copy images to public directory (requires sudo)
4. Build and deploy to production

## 📋 Manual Workflow

If you want to run steps individually:

### Step 1: Generate Story Text

```bash
node --import tsx scripts/generate-story.ts [story-type]
```

This creates an MDX file in `src/content/stories/` with:
- Full story content
- Metadata (characters, locations, date)
- Agatha's ending about why stories are free
- Frontmatter with image paths

### Step 2: Generate Illustrations

```bash
node scripts/generate-story-images.mjs "SLUG" "TITLE" "SUMMARY"
```

Generates 3 illustrations to `/tmp/`:
- `{slug}-featured.png` - Featured/hero image
- `{slug}-inline1.png` - First inline illustration
- `{slug}-inline2.png` - Second inline illustration

Uses **HiDream-I1 Fast** model for Nordic children's book style.

### Step 3: Copy Images to Public

```bash
sudo sh scripts/copy-story-images.sh SLUG
```

Copies images from `/tmp/` to `/var/www/vhosts/pjuskeby.org/public/assets/agatha/story/`
Sets correct ownership and permissions.

### Step 4: Build and Deploy

```bash
cd /var/www/vhosts/pjuskeby.org
npm run build
cp -r dist/* httpdocs/
pm2 restart pjuskeby-web
```

## 🎨 Illustration Style

All illustrations are:
- Hand-drawn watercolor style
- Nordic children's book aesthetic (Jansson, Egner, Vestly influence)
- Warm hues and playful layouts
- Include tiny Stickman character with teacup
- Signed "Agatha Splint" in bottom-right corner
- **NOT photorealistic** - illustrative and whimsical

## 📂 File Structure

```
scripts/
├── generate-story.ts                 # AI story generation (GPT-4o/Claude)
├── generate-story-images.mjs         # Runware.ai image generation
├── copy-story-images.sh              # Sudo script to copy images
└── generate-complete-story.sh        # Complete workflow

src/
├── content/
│   ├── config.ts                     # Story schema with image fields
│   └── stories/                      # Generated story MDX files
│       └── YYYY-MM-DD-type-slug.mdx
└── pages/
    └── historier/
        └── [...slug].astro           # Story template with images

public/assets/agatha/story/           # Story illustrations
└── {slug}-featured.png
└── {slug}-inline1.png
└── {slug}-inline2.png

httpdocs/json/
├── oneliners.json                    # Tea break interruptions
└── endings_full.json                 # Agatha's "why it's free" endings
```

## 🧩 Story Schema

```typescript
{
  title: string;              // Story title
  type: 'agatha-diary' | 'rumor' | 'event';
  date: Date;                 // Publication date
  characters: string[];       // Character names mentioned
  locations: string[];        // Place names mentioned
  summary: string;            // First 150 chars
  published: boolean;         // Whether to show
  hasIllustrations: boolean;  // Whether Agatha images exist
  featuredImage: string;      // Path to featured image
}
```

## 🤖 AI Configuration

### OpenAI (Primary)
- Model: `gpt-4o`
- Temperature: 0.85
- Max tokens: 2500
- System prompt: "You are Agatha Splint..."

### Anthropic (Fallback)
- Model: `claude-3-5-sonnet-20241022`
- Max tokens: 3000

Requires `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env`

## 🎭 Story Types

### 1. Agatha's Diary
First-person diary entries from Agatha's perspective. Observant, slightly judgmental but ultimately kind. Notices small absurdities.

Format:
- Starts with personal observation
- Includes gossip and reflections
- First person, intimate tone
- Tea break interruptions

### 2. Rumors
Gossip spreading around town. Someone heard something, embellished it, and now everyone's talking.

Format:
- Third person narrative
- Multiple character perspectives
- Building absurdity
- Truth revealed (mundane or stranger)

### 3. Events
Unusual events happening in Pjuskeby. Something unexpected brings characters together.

Format:
- Third person narrative
- Sensory details and atmosphere
- Character reactions
- Resolution or continued mystery

## 🔧 Troubleshooting

### Images not showing
```bash
# Check if images exist
ls -lh /var/www/vhosts/pjuskeby.org/public/assets/agatha/story/

# Check built images
ls -lh /var/www/vhosts/pjuskeby.org/httpdocs/client/assets/agatha/story/

# Verify permissions
stat /var/www/vhosts/pjuskeby.org/public/assets/agatha/story/*.png
```

### Story not appearing
```bash
# Check if MDX file exists
ls -lh src/content/stories/

# Validate frontmatter
head -20 src/content/stories/YYYY-MM-DD-*.mdx

# Rebuild
npm run build
```

### Permission denied
```bash
# The public/assets/agatha/ directory is root-owned
# Always use sudo for image operations:
sudo sh scripts/copy-story-images.sh SLUG
```

## 📊 Data Sources

Stories pull random characters, places, and businesses from:
- `content/data/people.normalized.json`
- `content/data/places.normalized.json`
- `content/data/businesses.normalized.json`
- `content/data/streets.normalized.json`

Interruptions and endings from:
- `httpdocs/json/oneliners.json` (100+ tea break lines)
- `httpdocs/json/endings_full.json` (18+ "why it's free" endings)

## 🌐 Live URLs

Stories appear at:
```
https://pjuskeby.org/historier/{slug}
```

Story index:
```
https://pjuskeby.org/historier
```

## 📅 Automated Daily Stories

Cron job runs daily story generation:
```bash
# See: scripts/daily-story.sh
0 6 * * * /var/www/vhosts/pjuskeby.org/scripts/daily-story.sh
```

## 🎨 Custom Illustration Component

Stories can embed inline illustrations in MDX:

```html
<agatha-illustration 
  src="/assets/agatha/story/{slug}-inline1.png" 
  alt="Description of scene"
  position="center|left|right"
/>
```

## 💡 Writing Philosophy

Agatha's stories:
- Are narrative, not descriptive
- Allow tears inside laughter
- Find wonder in the ordinary
- Never preach or moralize
- Tell stories like trees remember things – slowly, irregularly, with bark and feeling

---

**Created with:** GPT-4o, Claude, Runware.ai, Astro, and a slightly haunted teacup.
