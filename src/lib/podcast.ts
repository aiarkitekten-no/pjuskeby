/**
 * Utility to fetch and parse podcast RSS feed from Substack
 */

interface PodcastEpisode {
  guid: string;
  title: string;
  description: string;
  pubDate: Date;
  audioUrl: string;
  duration: string;
  episodeNumber?: number;
  imageUrl?: string;
  slug: string;
}

const RSS_FEED_URL = 'https://api.substack.com/feed/podcast/5910955.rss';

/**
 * Fetch and parse the Substack podcast RSS feed
 */
export async function fetchPodcastEpisodes(): Promise<PodcastEpisode[]> {
  try {
    const response = await fetch(RSS_FEED_URL);
    const xmlText = await response.text();
    
    // Parse XML (basic regex-based parsing for RSS)
    const episodes: PodcastEpisode[] = [];
    
    // Extract all <item> elements
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = xmlText.match(itemRegex);
    
    if (!items) return [];
    
    for (const item of items) {
      // Extract fields from each item
      const title = extractTag(item, 'title');
      const description = extractTag(item, 'description');
      const pubDateStr = extractTag(item, 'pubDate');
      const guid = extractTag(item, 'guid');
      
      // Extract audio URL from <enclosure> tag
      const enclosureMatch = item.match(/<enclosure[^>]+url="([^"]+)"/);
      const audioUrl = enclosureMatch ? enclosureMatch[1] : '';
      
      // Extract duration from iTunes tag
      const duration = extractTag(item, 'itunes:duration') || '00:00';
      
      // Extract episode number
      const episodeMatch = item.match(/<itunes:episode>(\d+)<\/itunes:episode>/);
      const episodeNumber = episodeMatch ? parseInt(episodeMatch[1]) : undefined;
      
      // Extract image
      const imageMatch = item.match(/<itunes:image[^>]+href="([^"]+)"/);
      const imageUrl = imageMatch ? imageMatch[1] : undefined;
      
      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      episodes.push({
        guid,
        title,
        description: cleanHtml(description),
        pubDate: new Date(pubDateStr),
        audioUrl,
        duration,
        episodeNumber,
        imageUrl,
        slug
      });
    }
    
    // Sort by date descending (newest first)
    episodes.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    
    return episodes;
  } catch (error) {
    console.error('Failed to fetch podcast RSS feed:', error);
    return [];
  }
}

/**
 * Extract content from XML tag
 */
function extractTag(xml: string, tagName: string): string {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`));
  if (match) {
    return match[1].trim();
  }
  return '';
}

/**
 * Clean HTML tags from description
 */
function cleanHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Format duration from seconds or HH:MM:SS to readable format
 */
export function formatDuration(duration: string): string {
  if (!duration) return '0:00';
  
  // If it's already in HH:MM:SS or MM:SS format
  if (duration.includes(':')) {
    return duration;
  }
  
  // If it's in seconds
  const seconds = parseInt(duration);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}
