/* Pjuskeby Guardrails:
   - Ingen placeholders. Ingen ubrukte exports.
   - Følg koblinger.json for datakilder og relasjoner.
   - All skriving til DB/FS logges i donetoday.json.
   - Ved AI-generering: aldri publiser direkte; legg i drafts/.
   - Ved valideringsfeil: returner 422, ikke "tøm felt".
*/

import { z, defineCollection } from 'astro:content';

const storiesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['agatha-diary', 'rumor', 'event']),
    date: z.coerce.date(),
    characters: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    summary: z.string(),
    published: z.boolean().default(true),
    featuredImage: z.string().optional(), // Path to featured image
    hasIllustrations: z.boolean().default(true), // Whether story has Agatha Splint illustrations (default: true for autonomy)
  }),
});

export const collections = {
  stories: storiesCollection,
};
